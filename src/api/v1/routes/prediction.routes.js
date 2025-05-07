// src/api/v1/routes/prediction.routes.js
import express from 'express';
import * as predictionController from '../controllers/prediction.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'; // Middleware de autenticación general
import { isAnalyst } from '../middlewares/roleCheckMiddleware.js'; // Middleware específico para rol

const router = express.Router();

// --- Rutas que requieren ser Analista ---
// Crear nueva predicción
router.post('/create',  isAnalyst, predictionController.handleCreatePrediction);

// Actualizar una predicción existente
router.patch('/update/:id', isAnalyst, predictionController.handleUpdatePrediction);
// O usa PUT si reemplazas completamente el recurso:
// router.put('/update/:id', authenticateToken, isAnalyst, predictionController.handleUpdatePrediction);

// Eliminar una predicción
router.delete('/delete/:id', isAnalyst, predictionController.handleDeletePrediction);


// --- Rutas que requieren solo estar Autenticado (Analista o Basic) ---
// Obtener todas las predicciones (con posibles filtros en query params)
router.get('/get/all', predictionController.handleGetAllPredictions);

// Obtener predicciones por símbolo de criptomoneda
router.get('/get/symbol/:symbol',  predictionController.handleGetPredictionsBySymbol);

// Obtener una predicción específica por ID
router.get('/get/:id',  predictionController.handleGetPredictionById);


export default router;