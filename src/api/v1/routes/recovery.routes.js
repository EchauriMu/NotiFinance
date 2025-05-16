import express from 'express';
import { requestPasswordReset, resetPassword, requestPasswordResetWithToken } from '../controllers/recovery.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', requestPasswordReset); // Sin token, por body
router.post('/send-auth', authenticateToken, requestPasswordResetWithToken); // Con token, por token
router.post('/reset-password', resetPassword);

export default router;
