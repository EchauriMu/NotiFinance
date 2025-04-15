
import express from 'express';
import { sendVerificationMessage, verifyPhoneCode } from '../controllers/whatsapp.controller';

const router = express.Router();
router.post('/send', sendVerificationMessage);
router.post('/verify-code', verifyPhoneCode);

export default router;
