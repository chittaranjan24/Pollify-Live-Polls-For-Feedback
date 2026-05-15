import express from 'express';
import {optionalAuth} from '../auth/auth.middleware.js';
import pollResponseController from './pollResponse.controller.js';

const router = express.Router();

// POST /api/responses/submit - Submit poll response
router.post('/submit', optionalAuth, pollResponseController.submitResponse);

export default router;