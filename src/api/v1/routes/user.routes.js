import express from 'express';
import { getUserProfile, postDiscordSetting } from '../controllers/user.controller.js';

const router = express.Router();
router.get('/profile', getUserProfile);
router.post('/settings/discord', postDiscordSetting);
export default router;
