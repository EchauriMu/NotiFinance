// src/api/v1/controllers/prediction.controller.js
import * as predictionService from '../services/prediction.service.js';

// Crear una nueva predicción (SOLO ANALISTAS)
export const handleCreatePrediction = async (req, res) => {
  try {
    // El rol ya debería estar verificado por el middleware 'isAnalyst'
    const analystId = req.userTk.id;
    const analystUsername = req.userTk.username; // Asume que el username está en el token

    // Validación básica de entrada (puedes usar express-validator para más robustez)
    const { cryptoSymbol, predictionText } = req.body;
    if (!cryptoSymbol || !predictionText) {
      return res.status(400).json({ message: 'Faltan campos requeridos (cryptoSymbol, predictionText).' });
    }

    const predictionData = { cryptoSymbol, predictionText };
    const newPrediction = await predictionService.createPrediction(predictionData, analystId, analystUsername);
    res.status(201).json(newPrediction);
  } catch (error) {
    console.error("Controller Error - handleCreatePrediction:", error);
    res.status(500).json({ message: error.message || 'Error interno al crear la predicción.' });
  }
};

// Obtener todas las predicciones (TODOS LOS USUARIOS AUTENTICADOS)
export const handleGetAllPredictions = async (req, res) => {
  try {
    // Podrías pasar req.query al servicio para filtros futuros
    const predictions = await predictionService.getAllPredictions(req.query);
    res.status(200).json(predictions);
  } catch (error) {
     console.error("Controller Error - handleGetAllPredictions:", error);
    res.status(500).json({ message: error.message || 'Error interno al obtener predicciones.' });
  }
};

// Obtener predicciones por símbolo (TODOS LOS USUARIOS AUTENTICADOS)
export const handleGetPredictionsBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
         return res.status(400).json({ message: 'Falta el símbolo de la criptomoneda.' });
    }
    const predictions = await predictionService.getPredictionsBySymbol(symbol);
    res.status(200).json(predictions);
  } catch (error) {
     console.error("Controller Error - handleGetPredictionsBySymbol:", error);
    res.status(500).json({ message: error.message || 'Error interno al obtener predicciones por símbolo.' });
  }
};


// Obtener una predicción específica por ID (TODOS LOS USUARIOS AUTENTICADOS)
export const handleGetPredictionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await predictionService.getPredictionById(id);
    res.status(200).json(prediction);
  } catch (error) {
     console.error("Controller Error - handleGetPredictionById:", error);
     if (error.message === 'Predicción no encontrada.') {
         return res.status(404).json({ message: error.message });
     }
    res.status(500).json({ message: error.message || 'Error interno al obtener la predicción.' });
  }
};

// Actualizar una predicción (SOLO ANALISTA PROPIETARIO)
export const handleUpdatePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestingAnalystId = req.userTk.id; // ID del analista que hace la petición

    // Validación básica
    if (Object.keys(updateData).length === 0) {
       return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }
    // Puedes añadir validación más específica para los campos que se pueden actualizar

    const updatedPrediction = await predictionService.updatePrediction(id, updateData, requestingAnalystId);
    res.status(200).json(updatedPrediction);
  } catch (error) {
     console.error("Controller Error - handleUpdatePrediction:", error);
      if (error.message === 'Predicción no encontrada.') {
         return res.status(404).json({ message: error.message });
     }
      if (error.message === 'No tienes permiso para modificar esta predicción.') {
         return res.status(403).json({ message: error.message });
     }
    res.status(500).json({ message: error.message || 'Error interno al actualizar la predicción.' });
  }
};

// Eliminar una predicción (SOLO ANALISTA PROPIETARIO)
export const handleDeletePrediction = async (req, res) => {
  try {
     const { id } = req.params;
     const requestingAnalystId = req.userTk.id;

     const result = await predictionService.deletePrediction(id, requestingAnalystId);
     res.status(200).json(result); // O res.status(204).send() si no devuelves contenido
  } catch (error) {
    console.error("Controller Error - handleDeletePrediction:", error);
     if (error.message === 'Predicción no encontrada.') {
         return res.status(404).json({ message: error.message });
     }
      if (error.message === 'No tienes permiso para eliminar esta predicción.') {
         return res.status(403).json({ message: error.message });
     }
    res.status(500).json({ message: error.message || 'Error interno al eliminar la predicción.' });
  }
};