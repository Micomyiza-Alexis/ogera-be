import { DB } from "@/database";
import { Op, WhereOptions } from "sequelize";

const repo = {
  createJob: async (jobData: any) => {
    return await DB.Jobs.create(jobData);
  },

  findAllJobs: async (filters?: {
    status?: string;
    funded?: boolean;
    employer_id?: string;
    search?: string;
    location?: string;
    category?: string;
    currency?: string;
    budget_min?: number;
    budget_max?: number;
  }) => {
    const whereClause: WhereOptions = {};

    if (filters?.status) {
      whereClause.status = filters.status as
        | "Pending"
        | "Active"
        | "Inactive"
        | "Completed";
    }

    if (filters?.employer_id) {
      whereClause.employer_id = filters.employer_id;
    }

    if (filters?.location) {
      whereClause.location = { [Op.iLike]: `%${filters.location}%` };
    }

    if (filters?.category) {
      whereClause.category = filters.category;
    }

    if (filters?.currency) {
      whereClause.currency = filters.currency;
    }

    if (
      typeof filters?.budget_min === "number" ||
      typeof filters?.budget_max === "number"
    ) {
      whereClause.budget = {
        ...(typeof filters?.budget_min === "number"
          ? { [Op.gte]: filters.budget_min }
          : {}),
        ...(typeof filters?.budget_max === "number"
          ? { [Op.lte]: filters.budget_max }
          : {}),
      };
    }

    if (filters?.funded === true) {
      whereClause.funding_status = { [Op.in]: ["Funded", "Paid"] };
    } else if (filters?.funded === false) {
      whereClause.funding_status = "Unfunded";
    }

    // ✅ FIX APPLIED HERE
    if (filters?.search) {
      (whereClause as any)[Op.or] = [
        { job_title: { [Op.iLike]: `%${filters.search}%` } },
        { location: { [Op.iLike]: `%${filters.search}%` } },
        { category: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return await DB.Jobs.findAll({
      where: whereClause,
      include: [
        {
          model: DB.Users,
          as: "employer",
          attributes: ["user_id", "full_name", "role_id"],
          include: [
            {
              model: DB.Roles,
              as: "role",
              attributes: ["roleName"],
            },
          ],
        },
        {
          model: DB.JobQuestions,
          as: "questions",
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  findJobById: async (job_id: string) => {
    return await DB.Jobs.findOne({
      where: { job_id },
      include: [
        {
          model: DB.Users,
          as: "employer",
          attributes: ["user_id", "full_name", "role_id"],
          include: [
            {
              model: DB.Roles,
              as: "role",
              attributes: ["roleName"],
            },
          ],
        },
        {
          model: DB.JobQuestions,
          as: "questions",
        },
      ],
    });
  },

  updateJob: async (job_id: string, updates: any) => {
    const [rows] = await DB.Jobs.update(updates, {
      where: { job_id },
    });

    if (rows === 0) return null;

    return await DB.Jobs.findOne({
      where: { job_id },
      include: [
        {
          model: DB.Users,
          as: "employer",
          attributes: ["user_id", "full_name", "role_id"],
          include: [
            {
              model: DB.Roles,
              as: "role",
              attributes: ["roleName"],
            },
          ],
        },
        {
          model: DB.JobQuestions,
          as: "questions",
        },
      ],
    });
  },

  createJobQuestions: async (job_id: string, questions: any[]) => {
    await DB.JobQuestions.destroy({ where: { job_id } });

    const questionPromises = questions.map((q, index) =>
      DB.JobQuestions.create({
        job_id,
        question_text: q.question_text,
        question_type: q.question_type || "text",
        is_required: q.is_required ?? false,
        options: q.options
          ? typeof q.options === "string"
            ? q.options
            : JSON.stringify(q.options)
          : null,
        display_order: q.display_order ?? index,
      })
    );

    return await Promise.all(questionPromises);
  },

  deleteJob: async (job_id: string) => {
    const rows = await DB.Jobs.destroy({ where: { job_id } });
    return rows > 0;
  },

  findEmployerByNameAndRole: async (full_name: string) => {
    return await DB.Users.findOne({
      where: { full_name },
      include: [
        {
          model: DB.Roles,
          as: "role",
          attributes: ["roleName"],
          where: { roleName: "employer" },
        },
      ],
    });
  },

  findJobByEmployerAndUniqueFields: async (
    employer_id: string,
    job_title?: string,
    location?: string
  ) => {
    return await DB.Jobs.findOne({
      where: { employer_id, job_title, location },
    });
  },
};

export default repo;