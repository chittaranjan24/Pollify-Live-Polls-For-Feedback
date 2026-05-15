import express from 'express';
import {authenticate} from '../auth/auth.middleware.js';
import pollsController from './polls.controller.js';

const router = express.Router();

// POST /api/polls - Create a poll (auth required)
router.post('/', authenticate, pollsController.createPolls);

// GET /api/polls/my - Get creator's polls (auth required)
router.get('/my', authenticate, pollsController.getMyPolls);

// GET /api/polls/share/:shareCode - Get poll by share code (public)
router.get('/share/:shareCode', pollsController.getPollByShareCode);

// GET /api/polls/:id - Get poll by ID (creator only, full data)
router.get('/:id', authenticate, pollsController.getPollById);

// GET /api/polls/:id/analytics - Get analytics (creator only)
router.get('/:id/analytics', authenticate, pollsController.getPollAnalytics);

// PATCH /api/polls/:id/toggle-active - Toggle active status
router.patch('/:id/toggle-active', authenticate, pollsController.togglePollActive);

// PATCH /api/polls/:id/publish - Publish results
router.patch('/:id/publish', authenticate, pollsController.publishPollResults);

// DELETE /api/polls/:id
router.delete('/:id', authenticate, pollsController.deletePoll);

export default router;