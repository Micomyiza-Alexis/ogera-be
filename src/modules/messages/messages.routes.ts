import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getUnreadCount,
  deleteConversation,
} from './messages.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { messageFileUpload } from '@/utils/messageFileUpload';

const messagesRouter = express.Router();

// Get all conversations for the authenticated user
messagesRouter.get(
  '/conversations',
  authMiddleware,
  getConversations
);

// Create or get a conversation
messagesRouter.post(
  '/conversations',
  authMiddleware,
  createConversation
);

// Get messages for a specific conversation
messagesRouter.get(
  '/:conversationId',
  authMiddleware,
  getMessages
);

// Send a message in a conversation (with optional file upload)
messagesRouter.post(
  '/:conversationId/send',
  authMiddleware,
  messageFileUpload.single('file'),
  sendMessage
);

// Get unread message count
messagesRouter.get(
  '/:conversationId/unread-count',
  authMiddleware,
  getUnreadCount
);

// Delete a conversation
messagesRouter.delete(
  '/:conversationId',
  authMiddleware,
  deleteConversation
);

export default messagesRouter;
