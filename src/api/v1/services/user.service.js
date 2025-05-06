import { User } from '../models/userModel.js';
import {Subscription}from '../models/subsModel'


import { Alert } from "../models/alertModel.js";

export const getUserInfo = async (userId) => {
  try {
    if (!userId) throw new Error('ID de usuario no proporcionado');

    // Obtener información básica del usuario
    const user = await User.findById(userId).select('username email role lastLogin');
    if (!user) throw new Error('Usuario no encontrado');

    // Buscar la suscripción activa del usuario
    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    // Preparar la respuesta con la información básica más el plan y fecha de expiración
    const response = {
      ...user.toObject(),
      plan: subscription ? subscription.plan : 'Freemium',
      subscriptionExpiresAt: subscription ? subscription.expiresAt : null
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('❌ [UserService] Error:', error.message);
    return { success: false, message: error.message };
  }
};

import { UserSettings } from '../models/notiModel.js';

export const updateDiscordByUserId = async (userId, discordId) => {
  try {
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          'notificationSettings.discord': discordId.trim(),
          updatedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return updatedSettings;
  } catch (error) {
    console.error(`[updateDiscordByUserId] Error al actualizar Discord ID:`, error);
    throw new Error('No se pudo actualizar el Discord ID');
  }
};


export const removeNotificationDataAndAlerts = async (userId, type) => {
  if (!['email', 'whatsapp', 'discord'].includes(type)) {
    throw new Error('Tipo de notificación inválido');
  }

  // 1. Eliminar el dato de notificación del usuario
  const updateField = {};
  updateField[`notificationSettings.${type}`] = "";

  const updatedSettings = await UserSettings.findOneAndUpdate(
    { userId },
    { $set: updateField },
    { new: true }
  );

  if (!updatedSettings) {
    throw new Error("Configuración de usuario no encontrada");
  }

  // 2. Eliminar alertas del tipo especificado para ese usuario
  const deleteResult = await Alert.deleteMany({
    userId,
    typeNotification: type
  });

  return {
    updatedSettings,
    deletedAlerts: deleteResult.deletedCount
  };
};
