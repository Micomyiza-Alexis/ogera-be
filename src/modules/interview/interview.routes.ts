import express, { Router } from 'express';
import { getMyInterviews, scheduleInterview } from './interview.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router: Router = express.Router();

// GET /api/interviews/my - List interviews for the logged-in student
router.get('/my', authMiddleware, getMyInterviews);

// POST /api/interviews - Employer schedules an interview with a student
router.post('/', authMiddleware, scheduleInterview);

export default router;
