import express from 'express';
import { getUserProfile, postDiscordSetting , deleteNotificationType, applyForAnalystRole, getAllUsers, softDeleteUser, hardDeleteUser, reactivateUser, changeUserRole } from '../controllers/user.controller.js';
import { isAdmin } from '../middlewares/AdminRoleMiddleware.js';

const router = express.Router();
router.get('/profile', getUserProfile);
router.post('/settings/discord', postDiscordSetting);
router.delete('/deleted/notisetting', deleteNotificationType);
router.post('/apply-for-analyst', applyForAnalystRole);
router.get('/all',isAdmin, getAllUsers);
router.patch('/delete/soft/:userId', isAdmin, softDeleteUser); // Eliminación lógica
router.delete('/delete/hard/:userId', isAdmin, hardDeleteUser); // Eliminación física
router.patch('/reactivate/:userId', isAdmin, reactivateUser); // Reactivar usuario
router.patch('/role/:userId', isAdmin, changeUserRole); // Cambiar rol del usuario
export default router;
