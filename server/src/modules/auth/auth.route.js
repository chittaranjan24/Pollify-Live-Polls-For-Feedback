import express from 'express';

import authController from './auth.controller.js';
import {authenticate} from './auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get("/me", authenticate, authController.getMe);

export default router;