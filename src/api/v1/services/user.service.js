import { User } from '../models/userModel.js';
import {Subscription}from '../models/subsModel';
import axios from 'axios';
import config from '../../../config/config.js';

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


export const submitAnalystApplication = async (userId, applicationData) => {
  try {
    const user = await User.findById(userId).select('username email');
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const subject = `Nueva Solicitud para Analista: ${user.username}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Nueva Solicitud para ser Analista en NotiFinance</h2>
        <p><strong>Usuario:</strong> ${userId}</p>
        <p><strong>Usuario:</strong> ${user.username}</p>
        <p><strong>Email del Usuario:</strong> ${user.email}</p>
        <hr>
        <h3>Detalles de la Solicitud:</h3>
        <p><strong>Motivación:</strong></p>
        <p style="white-space: pre-wrap;">${applicationData.motivation || 'No proporcionada'}</p>
        <p><strong>Experiencia y Conocimiento:</strong></p>
        <p style="white-space: pre-wrap;">${applicationData.experience || 'No proporcionada'}</p>
        
        <h4>Perfiles Sociales/Públicos:</h4>
        <ul>
          <li><strong>Twitter/X:</strong> ${applicationData.twitterUrl ? `<a href="${applicationData.twitterUrl}">${applicationData.twitterUrl}</a>` : 'No proporcionado'}</li>
          <li><strong>Otro Perfil:</strong> ${applicationData.otherPublicProfileUrl ? `<a href="${applicationData.otherPublicProfileUrl}">${applicationData.otherPublicProfileUrl}</a>` : 'No proporcionado'}</li>
        </ul>
        
        <p><strong>Información Adicional:</strong></p>
        <p style="white-space: pre-wrap;">${applicationData.additionalInfo || 'No proporcionada'}</p>
        <hr>
        <p>Por favor, revisa esta solicitud y toma las acciones correspondientes.</p>
      </div>
    `;

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/albertopardo301@gmail.com`;
    const headers = {
        Authorization: `Bearer NotifinanceTK`,
        "Content-Type": "application/json"
      };

    await axios.post(emailSendURL, { content: emailContent, subject: subject }, { headers }); // Añade el subject

    return { success: true, message: 'Solicitud enviada correctamente.' };

  } catch (error) {
    console.error("Error en submitAnalystApplication service:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'No se pudo procesar la solicitud para ser analista.');
  }
};