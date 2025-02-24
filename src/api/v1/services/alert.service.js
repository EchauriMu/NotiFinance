import { Alert } from '../models/alertModel.js';
import { UserSettings } from '../models/notiModel'; // Importar el modelo

export const createAlert = async (data) => {
  try {
    const { userId, typeNotification } = data;

    console.log("🔍 Buscando configuración de usuario para:", userId);

    const userSettings = await UserSettings.findOne({ userId });

    if (!userSettings) {
      console.error("❌ Configuración de notificaciones no encontrada para el usuario:", userId);
      throw new Error("Configuración de notificaciones no encontrada");
    }
  const notificationData = userSettings.notificationSettings[typeNotification];

    if (!notificationData) {
      console.error(`❌ No hay configuración disponible para "${typeNotification}"`);
      throw new Error(`No hay configuración disponible para "${typeNotification}"`);
    }

   const alertData = { ...data, notificationData };

    const newAlert = await Alert.create(alertData);


    return newAlert;
  } catch (error) {
    console.error("🚨 ERROR al crear alerta:", error);
    throw error;
  }
};


// Obtener todas las alertas
export const getAllAlerts = async () => {
  return await Alert.find();
};

// Obtener una alerta por ID
export const getAlertById = async (id) => {
  return await Alert.findById(id);
};

// Actualizar una alerta
export const updateAlert = async (id, data) => {
  return await Alert.findByIdAndUpdate(id, data, { new: true });
};

// Eliminar una alerta
export const deleteAlert = async (id) => {
  return await Alert.findByIdAndDelete(id);
};
