import { Router } from 'express';
import authRoutes from './authRoutes';  // Rutas de autenticación
import userSettingsRoutes from './setting.routes';  // Rutas de configuración de usuario
import user from './user.routes';
import config from '../../../config/config';  // Configuración para el URL base
import { authenticateToken } from '../middlewares/authMiddleware'; // Importamos el middleware de autenticación
import foroRoutes from './foro.routes'
import AlertRoutes from './alerts.routes'
import whatsRoutes from './whatsapp.routes'
import subsRoutes from './subs.routes'
import { getServicesStatus } from '../controllers/status.controller';
import reserRoutes from './recovery.routes'
import configRoutes from './config.routes'
import predictionRoutes from './prediction.routes.js';

const routerAPI = (app) => {
  const router = Router();
  const api = config.API_URL;  // Obtener la URL base desde la configuración

  // Aplicamos el prefijo base a todas las rutas
  app.use(api, router);

  router.use('/auth', authRoutes);  // Ruta base es /api/v1/auth/login, /api/v1/auth/register
  router.use('/reset',  reserRoutes);

  router.use('/setting', authenticateToken, userSettingsRoutes); 
  router.use('/user', authenticateToken, user); 

  router.use('/foro', authenticateToken, foroRoutes); 
  router.use('/alert', authenticateToken, AlertRoutes);

  router.use('/whatsapp', authenticateToken, whatsRoutes);

  router.use('/subs', authenticateToken, subsRoutes);
  router.use('/status', authenticateToken, getServicesStatus);

  router.use('/config', authenticateToken, configRoutes);

  router.use('/prediction', authenticateToken, predictionRoutes);

  return router;
};

export default routerAPI;
