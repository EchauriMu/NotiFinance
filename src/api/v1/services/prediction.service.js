// src/api/v1/services/prediction.service.js
import { Prediction } from '../models/predictionModel.js';
import { User } from '../models/userModel.js'; // Importar User para verificar rol si es necesario

/**
 * Crea una nueva predicción.
 */
export const createPrediction = async (predictionData, analystId, analystUsername) => {
  try {
    // Añadimos el ID y username del analista a los datos
    const dataToSave = {
      ...predictionData,
      analystId,
      analystUsername,
    };
    const newPrediction = new Prediction(dataToSave);
    await newPrediction.save();
    return newPrediction;
  } catch (error) {
    console.error("Error creando predicción:", error);
    // Podrías manejar errores específicos de validación de Mongoose aquí
    throw new Error('Error al guardar la predicción en la base de datos.');
  }
};

export const getAllPredictions = async (filters = {}) => {
  try {

    const predictions = await Prediction.find(filters).sort({ createdAt: -1 }).lean(); // .lean() para objetos JS simples
    return predictions;
  } catch (error) {
    console.error("Error obteniendo predicciones:", error);
    throw new Error('Error al consultar las predicciones.');
  }
};

/**
 * Obtiene predicciones por símbolo de criptomoneda.
 */
export const getPredictionsBySymbol = async (symbol) => {
  try {
    const predictions = await Prediction.find({ cryptoSymbol: symbol.toUpperCase() })
      .sort({ createdAt: -1 })
      .lean();
    return predictions;
  } catch (error) {
    console.error(`Error obteniendo predicciones para ${symbol}:`, error);
    throw new Error(`Error al consultar las predicciones para ${symbol}.`);
  }
};


/**
 * Obtiene una predicción por su ID.
 */
export const getPredictionById = async (predictionId) => {
  try {
    const prediction = await Prediction.findById(predictionId).lean();
    if (!prediction) {
      throw new Error('PREDICTION_NOT_FOUND'); // Error específico
    }
    return prediction;
  } catch (error) {
    console.error("Error obteniendo predicción por ID:", error);
    if (error.message === 'PREDICTION_NOT_FOUND' || error.name === 'CastError') {
       throw new Error('Predicción no encontrada.');
    }
    throw new Error('Error al consultar la predicción.');
  }
};

/**
 * Actualiza una predicción existente. Verifica que el analista sea el propietario.
 */
export const updatePrediction = async (predictionId, updateData, requestingAnalystId) => {
  try {
    const prediction = await Prediction.findById(predictionId);

    if (!prediction) {
      throw new Error('PREDICTION_NOT_FOUND');
    }


    if (prediction.analystId.toString() !== requestingAnalystId.toString()) {
      throw new Error('FORBIDDEN_ACTION'); // No es el dueño
    }

    if (updateData.cryptoSymbol) prediction.cryptoSymbol = updateData.cryptoSymbol.toUpperCase();
    if (updateData.predictionText) prediction.predictionText = updateData.predictionText;

    await prediction.save();
    return prediction;

  } catch (error) {
    console.error("Error actualizando predicción:", error);
    if (error.message === 'PREDICTION_NOT_FOUND' || error.name === 'CastError') {
      throw new Error('Predicción no encontrada.');
    }
     if (error.message === 'FORBIDDEN_ACTION') {
      throw new Error('No tienes permiso para modificar esta predicción.');
    }
    throw new Error('Error al actualizar la predicción.');
  }
};

/**
 * Elimina una predicción. Verifica que el analista sea el propietario.
 */
export const deletePrediction = async (predictionId, requestingAnalystId) => {
  try {
    const prediction = await Prediction.findById(predictionId);

    if (!prediction) {
      throw new Error('PREDICTION_NOT_FOUND');
    }

    if (prediction.analystId.toString() !== requestingAnalystId.toString()) {
      throw new Error('FORBIDDEN_ACTION');
    }

    await Prediction.findByIdAndDelete(predictionId);
    return { message: 'Predicción eliminada correctamente.' }; // O devuelve el objeto eliminado si lo necesitas

  } catch (error) {
    console.error("Error eliminando predicción:", error);
     if (error.message === 'PREDICTION_NOT_FOUND' || error.name === 'CastError') {
      throw new Error('Predicción no encontrada.');
    }
     if (error.message === 'FORBIDDEN_ACTION') {
      throw new Error('No tienes permiso para eliminar esta predicción.');
    }
    throw new Error('Error al eliminar la predicción.');
  }
};