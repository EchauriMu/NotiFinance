import express from 'express';
import { getUserProfile, postDiscordSetting , deleteNotificationType} from '../controllers/user.controller.js';

const router = express.Router();
router.get('/profile', getUserProfile);
router.post('/settings/discord', postDiscordSetting);
router.delete('/deleted/notisetting', deleteNotificationType);
export default router;
