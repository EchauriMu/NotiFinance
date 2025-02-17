import { Router } from 'express';
import { getUserNotificationSettings } from '../controllers/userSetting.controller'; // Importamos el controlador

const router = Router();

// Ruta protegida, requiere autenticación para obtener la configuración de notificaciones
router.get('/get', getUserNotificationSettings);

export default router;
