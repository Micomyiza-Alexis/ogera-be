import repo from './notification.repo';
import { CustomError } from '@/utils/custom-error';
import { StatusCodes } from 'http-status-codes';
import { emailService, EmailType } from '@/services/email/email.service';
import { DB } from '@/database';
import { Op } from 'sequelize';
import { AdminBroadcastNotificationTemplate } from '@/templete/emailTemplete';

// Create a notification
export const createNotificationService = async (notificationData: {
  user_id: string;
  type: 'job_application' | 'application_status' | 'job_posted' | 'system';
  title: string;
  message: string;
  related_id?: string;
}) => {
  return await repo.createNotification(notificationData);
};

export const sendAdminNotificationService = async (params: {
  /** Present so the sender gets the same message in their own inbox (and unread count). */
  sender_user_id: string;
  sender_role?: string;
  title: string;
  message: string;
  target_mode: 'specific' | 'role';
  target_user_ids?: string[];
  target_roles?: Array<'student' | 'employer'>;
  send_email?: boolean;
}) => {
  const normalizedSenderRole = (params.sender_role || '').toLowerCase().trim();
  const senderLabel: 'Admin' | 'SuperAdmin' =
    normalizedSenderRole === 'superadmin' ? 'SuperAdmin' : 'Admin';
  const title = (params.title || '').trim();
  const message = (params.message || '').trim();
  if (!title || !message) {
    throw new CustomError('Title and message are required', StatusCodes.BAD_REQUEST);
  }
  const decoratedTitle = `[${senderLabel}] ${title}`;
  const decoratedMessage = `${message}\n\nSent by ${senderLabel}`;

  const targetMode = params.target_mode;
  const targetRoles =
    targetMode === 'role'
      ? Array.from(new Set((params.target_roles || []).map((r) => r.toLowerCase()))).filter(
          (r) => r === 'student' || r === 'employer'
        )
      : [];
  const targetUserIds =
    targetMode === 'specific'
      ? Array.from(new Set((params.target_user_ids || []).filter(Boolean)))
      : [];

  if (targetMode === 'role' && targetRoles.length === 0) {
    throw new CustomError('At least one target role is required', StatusCodes.BAD_REQUEST);
  }
  if (targetMode === 'specific' && targetUserIds.length === 0) {
    throw new CustomError('At least one target user is required', StatusCodes.BAD_REQUEST);
  }

  const recipients = await repo.findUsersForNotificationTargets(targetMode, targetRoles, targetUserIds);
  if (!recipients.length) {
    throw new CustomError('No recipients found for selected target', StatusCodes.NOT_FOUND);
  }

  const notificationsPayload = recipients.map((recipient: any) => ({
    user_id: recipient.user_id,
    type: 'system',
    title: decoratedTitle,
    message: decoratedMessage,
  }));
  // Guard against accidental double-submit (or retried request) creating duplicate rows.
  // If the same user already has the same system notification in the last 60 seconds, skip it.
  const uniqueRecipients = Array.from(
    new Set(notificationsPayload.map((n) => String(n.user_id)))
  );
  const duplicateWindowStart = new Date(Date.now() - 60 * 1000);
  const recentDuplicates = await DB.Notifications.findAll({
    where: {
      user_id: { [Op.in]: uniqueRecipients },
      type: 'system',
      title: decoratedTitle,
      message: decoratedMessage,
      created_at: { [Op.gte]: duplicateWindowStart },
    },
    attributes: ['user_id'],
  });
  const recentlyNotifiedUserIds = new Set(
    recentDuplicates.map((row: any) => String(row.user_id))
  );
  const notificationsToCreate = notificationsPayload.filter(
    (n) => !recentlyNotifiedUserIds.has(String(n.user_id))
  );
  await repo.createNotificationsBulk(notificationsToCreate);

  // Copy for sender: non-superadmin admins only see their own user_id in GET /notifications.
  // Skip if the sender is already in the recipient list (avoids duplicate rows).
  const shouldCreateSenderCopy = normalizedSenderRole !== 'superadmin';
  const senderWasRecipient = recipients.some(
    (r: any) => String(r.user_id) === String(params.sender_user_id)
  );
  if (shouldCreateSenderCopy && !senderWasRecipient) {
    try {
      const senderAlreadyHasRecentCopy = await DB.Notifications.findOne({
        where: {
          user_id: params.sender_user_id,
          type: 'system',
          title: decoratedTitle,
          message: decoratedMessage,
          created_at: { [Op.gte]: duplicateWindowStart },
        },
        attributes: ['notification_id'],
      });
      if (senderAlreadyHasRecentCopy) {
        throw new Error('skip_sender_copy_duplicate');
      }
      await repo.createNotification({
        user_id: params.sender_user_id,
        type: 'system',
        title: decoratedTitle,
        message: decoratedMessage,
      });
    } catch (e) {
      if ((e as Error)?.message !== 'skip_sender_copy_duplicate') {
        console.error('Failed to create sender notification copy:', e);
      }
    }
  }

  let emailSentCount = 0;
  if (params.send_email) {
    await Promise.all(
      recipients.map(async (recipient: any) => {
        if (!recipient.email) return;
        try {
          const { html, text } = AdminBroadcastNotificationTemplate({
            recipientName: recipient.full_name,
            title,
            message,
            senderLabel,
          });
          await emailService.sendEmail({
            to: recipient.email,
            type: EmailType.CUSTOM,
            subject: decoratedTitle,
            html,
            text,
          });
          emailSentCount += 1;
        } catch (error) {
          console.error(`Failed sending notification email to ${recipient.email}:`, error);
        }
      })
    );
  }

  return {
    sent_count: recipients.length,
    email_sent_count: emailSentCount,
    target_mode: targetMode,
  };
};

// Get all notifications for a user; superAdmin gets all notifications from the table
export const getNotificationsService = async (
  user_id: string,
  options?: { is_read?: boolean; limit?: number },
  role?: string
) => {
  const isSuperAdmin = role?.toLowerCase() === 'superadmin';
  if (isSuperAdmin) {
    return await repo.findAllNotifications(options);
  }
  return await repo.findNotificationsByUserId(user_id, options);
};

// Get unread notification count
export const getUnreadNotificationCountService = async (user_id: string) => {
  const count = await repo.countUnreadNotifications(user_id);
  return { count };
};

// Mark notification as read
export const markNotificationAsReadService = async (
  notification_id: string,
  user_id: string
) => {
  const updated = await repo.markAsRead(notification_id, user_id);
  if (!updated) {
    throw new CustomError('Notification not found or access denied', StatusCodes.NOT_FOUND);
  }
  return await repo.findNotificationById(notification_id);
};

// Mark all notifications as read
export const markAllNotificationsAsReadService = async (user_id: string, role?: string) => {
  const isSuperAdmin = role?.toLowerCase() === 'superadmin';
  const count = isSuperAdmin
    ? await repo.markAllAsReadAll()
    : await repo.markAllAsRead(user_id);
  return { count };
};

// Delete notification
export const deleteNotificationService = async (
  notification_id: string,
  user_id: string
) => {
  const deleted = await repo.deleteNotification(notification_id, user_id);
  if (!deleted) {
    throw new CustomError('Notification not found or access denied', StatusCodes.NOT_FOUND);
  }
  return { success: true };
};

// Helper: Create job application notification for employer
export const createJobApplicationNotification = async (
  employer_id: string,
  application_id: string,
  student_name: string,
  job_title: string
) => {
  return await createNotificationService({
    user_id: employer_id,
    type: 'job_application',
    title: 'New Job Application',
    message: `${student_name} has applied for your job: ${job_title}`,
    related_id: application_id,
  });
};

// Helper: Create application status notification for student
export const createApplicationStatusNotification = async (
  student_id: string,
  application_id: string,
  job_title: string,
  status: 'Accepted' | 'Rejected'
) => {
  const statusText = status === 'Accepted' ? 'accepted' : 'rejected';
  const emoji = status === 'Accepted' ? '✅' : '❌';
  
  return await createNotificationService({
    user_id: student_id,
    type: 'application_status',
    title: `Application ${status}`,
    message: `${emoji} Your application for "${job_title}" has been ${statusText}`,
    related_id: application_id,
  });
};

