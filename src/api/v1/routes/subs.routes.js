

import express from 'express';
import * as subscriptionController from '../controllers/subs.controller.js';

const router = express.Router();

// Ruta para solicitar cambio de plan
router.post('/changeplan', subscriptionController.requestPlanChange);


// Nueva ruta para actualizar suscripción basada en plan
router.put('/update', subscriptionController.update); // Actualizar suscripción del usuario

// Ruta para cancelar suscripción
router.post('/cancel', subscriptionController.cancel); // Cancelar suscripción

// Ruta para obtener suscripción activa
router.get('/me/active', subscriptionController.getActiveSubscription); // Obtener la suscripción activa

export default router;
