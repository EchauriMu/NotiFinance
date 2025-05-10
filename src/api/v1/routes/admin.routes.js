// src/api/v1/routes/admin.routes.js
import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/AdminRoleMiddleware.js'; // Importa el nuevo middleware

const router = express.Router();

// Aplicar autenticación y verificación de rol admin a todas las rutas de este archivo
router.use(authenticateToken, isAdmin);

// Rutas específicas del admin
router.get('/applications', adminController.getPendingApplicationsHandler);
router.patch('/applications/:applicationId/approve', adminController.approveApplicationHandler);
router.patch('/applications/:applicationId/reject', adminController.rejectApplicationHandler);
router.get('/analysts', adminController.getAllAnalystsHandler);
router.patch('/users/:userId/revoke-analyst-role', adminController.revokeAnalystRoleHandler); // << NUEVA RUTA

export default router;