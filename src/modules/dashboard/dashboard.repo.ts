import { DB } from "@/database";
import { Sequelize } from "sequelize";
import logger from "@/utils/logger";
import { MOMO_CONFIG } from "@/config";

const repo = {
  /**
   * Get total count of all users
   * Uses efficient COUNT query at database level
   */
  getTotalUsersCount: async (): Promise<number> => {
    try {
      const count = await DB.Users.count();
      logger.info(`[Dashboard] Total users count: ${count}`);
      return Number(count ?? 0);
    } catch (error) {
      logger.error(`[Dashboard] Error counting users:`, error);
      return 0;
    }
  },

  /**
   * Get total count of students
   * Uses efficient COUNT query with WHERE clause at database level
   */
  getTotalStudentsCount: async (): Promise<number> => {
    try {
      // Primary source: role relation (role_id -> roles.role_type) to reflect newly created users immediately.
      const countFromRoleRelation = await DB.Users.count({
        include: [
          {
            model: DB.Roles,
            as: 'role',
            where: { roleType: 'student' },
            attributes: [],
            required: true,
          },
        ],
        distinct: true,
        col: 'user_id',
      });

      // Fallback for legacy rows where role relation may be inconsistent but users.role_type exists.
      const count =
        Number(countFromRoleRelation ?? 0) > 0
          ? Number(countFromRoleRelation ?? 0)
          : await DB.Users.count({
              where: DB.sequelize
                ? DB.sequelize.where(
                    DB.sequelize.fn('LOWER', Sequelize.cast(DB.sequelize.col('role_type'), 'TEXT')),
                    'student',
                  )
                : { role_type: 'student' },
            });

      logger.info(`[Dashboard] Total students count: ${count}`);
      return Number(count ?? 0);
    } catch (error) {
      logger.error(`[Dashboard] Error counting students:`, error);
      return 0;
    }
  },

  /**
   * Get count of active jobs
   * Uses efficient COUNT query with WHERE clause at database level
   */
  getActiveJobsCount: async (): Promise<number> => {
    try {
      const count = await DB.Jobs.count({
        where: {
          status: "Active",
        },
      });
      logger.info(`[Dashboard] Active jobs count: ${count}`);
      return count || 0;
    } catch (error) {
      logger.error(`[Dashboard] Error counting active jobs:`, error);
      return 0;
    }
  },

  /**
   * Get dynamic Ogera wallet balance for super admin dashboard
   * Wallet balance = total funded from employers (budget + fee) - total paid to students
   */
  getTotalEarnings: async (): Promise<number> => {
    try {
      const { Op } = require('sequelize');
      const jobs = await DB.Jobs.findAll({
        where: { funding_status: { [Op.in]: ['Funded', 'Paid'] } },
        attributes: ['budget', 'funding_status', 'amount_paid_to_student'],
        raw: true,
      }) as Array<{ budget: number | string; funding_status?: string; amount_paid_to_student?: number | string | null }>;

      const feePct = Number(MOMO_CONFIG.serviceFeePercent ?? 0);
      let totalReceived = 0;
      let totalPaidToStudents = 0;

      for (const job of jobs) {
        const budget = Number(job.budget ?? 0);
        if (!budget || Number.isNaN(budget)) continue;

        const totalForJob = budget * (1 + feePct / 100);
        totalReceived += totalForJob;

        if (job.funding_status === 'Paid') {
          const paidAmount =
            job.amount_paid_to_student !== null && job.amount_paid_to_student !== undefined
              ? Number(job.amount_paid_to_student)
              : Math.round(totalForJob * 0.9);
          totalPaidToStudents += Number.isNaN(paidAmount) ? 0 : paidAmount;
        }
      }

      const walletBalance = Math.max(0, Math.round(totalReceived - totalPaidToStudents));
      logger.info(`[Dashboard] Total earnings (wallet balance): ${walletBalance}`);
      return walletBalance;
    } catch (error) {
      logger.error(`[Dashboard] Error calculating earnings:`, error);
      return 0;
    }
  },
  /**
   * Get recent activity logs
   */
  getRecentActivities: async (limit = 5) => {
    try {
      const normalizedLimit = Number.isFinite(Number(limit))
        ? Math.min(Math.max(Number(limit), 1), 50)
        : 5;

      const rows = await DB.ActivityLogs.findAll({
        order: [['created_at', 'DESC']],
        limit: normalizedLimit,
        raw: true,
      });
      return rows;
    } catch (error) {
      logger.error('[Dashboard] Error fetching recent activities:', error);
      return [];
    }
  },
  /**
   * Count applications for a student between two dates (inclusive start, exclusive end)
   */
  getStudentApplicationsCountBetween: async (studentId: string, start: Date, end: Date): Promise<number> => {
    try {
      const { Op } = require('sequelize');
      const count = await DB.JobApplications.count({
        where: {
          student_id: studentId,
          applied_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      });
      // If there are application rows, return them.
      if (count && count > 0) {
        logger.info(`[Dashboard] Student ${studentId} applications between ${start.toISOString()} and ${end.toISOString()}: ${count} (from JobApplications)`);
        return Number(count ?? 0);
      }

      // Fallback: some environments track application events in activity_logs.
      // Count activity log entries that look like an application event.
      // We try several heuristics: entity_type 'JobApplication' or description mentioning 'apply'/'appl'.
      try {
        const altCount = await DB.ActivityLogs.count({
          where: {
            user_id: studentId,
            created_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
            [Op.or]: [
              { entity_type: 'JobApplication' },
              { entity_type: 'Application' },
              // Description based fallback (case-insensitive)
              DB.sequelize.where(DB.sequelize.fn('LOWER', DB.sequelize.col('description')), {
                [Op.like]: '%appl%'
              }),
            ],
          },
        });

        logger.info(`[Dashboard] Student ${studentId} applications between ${start.toISOString()} and ${end.toISOString()}: ${altCount} (from ActivityLogs fallback)`);
        return Number(altCount ?? 0);
      } catch (e) {
        logger.warn('[Dashboard] ActivityLogs fallback failed:', e);
        return 0;
      }
    } catch (error) {
      logger.error('[Dashboard] Error counting student applications:', error);
      return 0;
    }
  },

  /**
   * Sum earnings for a student between two dates (uses transactions table)
   * Returns { total: number, currency: string | null }
   */
  getStudentEarningsBetween: async (studentId: string, start: Date, end: Date): Promise<{ total: number; currency: string | null }> => {
    try {
      if ((DB as any).Transactions) {
        const { Op } = require('sequelize');
        const sumResult: any = await (DB as any).Transactions.sum('amount', {
          where: {
            user_id: studentId,
            created_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
        });

        const total = sumResult !== null && sumResult !== undefined ? Number(sumResult) : 0;

        // Find latest currency for this user in the period (fallback: any transaction currency)
        const latestTx: any = await (DB as any).Transactions.findOne({
          where: {
            user_id: studentId,
            created_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
          order: [['created_at', 'DESC']],
          attributes: ['currency'],
          raw: true,
        });

        const currency = latestTx ? latestTx.currency : null;

        logger.info(`[Dashboard] Student ${studentId} earnings between ${start.toISOString()} and ${end.toISOString()}: ${total} ${currency}`);
        return { total, currency };
      }
      return { total: 0, currency: null };
    } catch (error) {
      logger.error('[Dashboard] Error summing student earnings:', error);
      return { total: 0, currency: null };
    }
  },
    /**
     * Count jobs completed for a student between two dates (completed_at)
     */
    getStudentJobsCompletedBetween: async (studentId: string, start: Date, end: Date): Promise<number> => {
      try {
        const { Op } = require('sequelize');
        // Prefer explicit completed_at on job_applications
        const count = await DB.JobApplications.count({
          where: {
            student_id: studentId,
            completed_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          } as any,
        });
        logger.info(`[Dashboard] Student ${studentId} jobs completed between ${start.toISOString()} and ${end.toISOString()}: ${count}`);
        return Number(count ?? 0);
      } catch (error) {
        logger.error('[Dashboard] Error counting jobs completed:', error);
        return 0;
      }
    },

    /**
     * Count interviews for a student between two dates (uses interviews table)
     */
    getStudentInterviewsBetween: async (studentId: string, start: Date, end: Date): Promise<number> => {
      try {
        if (!(DB as any).Interviews) return 0;
        const { Op } = require('sequelize');
        const count = await (DB as any).Interviews.count({
          where: {
            student_id: studentId,
            scheduled_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
            status: {
              [Op.ne]: 'cancelled',
            },
          },
        });
        logger.info(`[Dashboard] Student ${studentId} interviews between ${start.toISOString()} and ${end.toISOString()}: ${count}`);
        return Number(count ?? 0);
      } catch (error) {
        logger.error('[Dashboard] Error counting interviews:', error);
        return 0;
      }
    },
};

export default repo;
