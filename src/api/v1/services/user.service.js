import { User } from '../models/userModel.js';
import {Subscription}from '../models/subsModel'

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
