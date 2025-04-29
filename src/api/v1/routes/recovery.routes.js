import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/recovery.controller.js';

const router = express.Router();

router.post('/send', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
