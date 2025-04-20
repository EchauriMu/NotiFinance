import express from 'express';
import { getServicesStatus } from '../controllers/status.controller.js';

const router = express.Router();

// Ruta para obtener el estado de todos los servicios
router.get('/', getServicesStatus);

export default router;
