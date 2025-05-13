import { User } from '../models/userModel.js';
import {Subscription}from '../models/subsModel';
import { AnalystApplication } from '../models/applicationAnalystModel.js';
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
      subscriptionExpiresAt: subscription ? subscription.expiresAt : null,
       autoRenew: subscription.autoRenew
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

    // 2. Verificar si ya existe una solicitud pendiente o aprobada para este usuario
    const existingApplication = await AnalystApplication.findOne({
      userId: user._id,
      status: { $in: ['pending', 'approved'] } // Considerar 'approved' también para evitar duplicados
    });

    if (existingApplication) {
      let message = 'Ya tienes una solicitud para ser analista.';
      if (existingApplication.status === 'pending') {
        message = 'Ya tienes una solicitud pendiente de revisión.';
      } else if (existingApplication.status === 'approved') {
        // Esto no debería pasar si el rol ya se actualizó, pero es una doble verificación.
        message = 'Tu solicitud para ser analista ya fue aprobada.';
      }
      const error = new Error(message);
      error.statusCode = 409; // Conflict, o 400 Bad Request
      throw error;
    }

    const newApplication = new AnalystApplication({
      userId: user._id,
      username: user.username,
      email: user.email,
      motivation: applicationData.motivation,
      experience: applicationData.experience,
      twitterUrl: applicationData.twitterUrl,
      otherPublicProfileUrl: applicationData.otherPublicProfileUrl,
      additionalInfo: applicationData.additionalInfo,
      status: 'pending', // Estado inicial
    });
    await newApplication.save();
    console.log('Solicitud de analista guardada en la BD:', newApplication._id);

    const subject = `Nueva Solicitud de Analista Pendiente: ${user.username}`;
    const emailContent = `
      <p>Se ha recibido una nueva solicitud para ser analista de parte de <strong>${user.username}</strong> (${user.email}).</p>
      <p>Por favor, revísala en el Panel de Administración.</p>
      <p>ID de Solicitud: ${newApplication._id}</p>
    `;

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/albertopardo301@gmail.com`;
    const headers = {
        Authorization: `Bearer NotifinanceTK`,
        "Content-Type": "application/json"
      };

    await axios.post(emailSendURL, { content: emailContent, subject: subject }, { headers }); // Añade el subject

    return { success: true, message: 'Solicitud enviada correctamente.' };

  } catch (error) {
    // Loguear el error que llega a este catch
    console.error(
        `Error en submitAnalystApplication service (catch general): "${error.message}" (Status: ${error.statusCode || 'No especificado'})`
    );

    // Si el error ya tiene un statusCode (porque lo lanzamos nosotros antes), lo respetamos.
    // Si no, es un error inesperado del sistema (ej. DB desconectada), y debería ser un 500.
    if (error.statusCode) {
      throw error; // Relanzar el error con su statusCode y mensaje originales
    } else {
      // Para errores no manejados explícitamente, crear uno nuevo con 500
      const internalError = new Error('Error interno del servicio al procesar la solicitud.');
      internalError.statusCode = 500;
      throw internalError;
    }
  }
};

export const getPendingApplications = async () => {
  try {
    // Busca aplicaciones pendientes, puedes ordenar por fecha, etc.
    const applications = await AnalystApplication.find({ status: 'pending' })
      .populate('userId', 'username email') // Opcional: traer datos del usuario
      .sort({ createdAt: -1 }); // Más recientes primero
    return applications;
  } catch (error) {
    console.error("Error en service getPendingApplications:", error.message);
    throw new Error('Error al obtener las solicitudes pendientes.');
  }
};

export const approveApplication = async (applicationId, adminUserId) => {
  try {
    const application = await AnalystApplication.findById(applicationId);
    if (!application) {
      throw new Error('Solicitud no encontrada.');
    }
    if (application.status !== 'pending') {
      throw new Error('Esta solicitud ya ha sido procesada.');
    }

    // Actualiza el estado de la solicitud
    application.status = 'approved';
    application.reviewedBy = adminUserId;
    application.reviewedAt = new Date();
    await application.save();

    // Actualiza el rol del usuario
    const user = await User.findById(application.userId);
    if (!user) {
      // Manejar caso raro donde el usuario ya no existe
      console.warn(`Usuario ${application.userId} no encontrado al aprobar solicitud ${applicationId}`);
      return { success: true, message: 'Solicitud aprobada, pero el usuario no fue encontrado.' };
    }
    user.role = 'analist'; // Cambia el rol a analista
    await user.save();

    // (Opcional) Enviar email de notificación al usuario aprobado
    // ... (lógica de envío de email similar a la de notificación al admin) ...

    return { success: true, message: 'Solicitud aprobada y rol de usuario actualizado.' };

  } catch (error) {
    console.error("Error en service approveApplication:", error.message);
    throw new Error('Error al aprobar la solicitud.');
  }
};

export const rejectApplication = async (applicationId, adminUserId) => {
  try {
    const application = await AnalystApplication.findById(applicationId);
    if (!application) {
      throw new Error('Solicitud no encontrada.');
    }
    if (application.status !== 'pending') {
      throw new Error('Esta solicitud ya ha sido procesada.');
    }

    // Actualiza el estado de la solicitud
    application.status = 'rejected';
    application.reviewedBy = adminUserId;
    application.reviewedAt = new Date();
    await application.save();

    // (Opcional) Enviar email de notificación al usuario rechazado
    // ... (lógica de envío de email) ...

    return { success: true, message: 'Solicitud rechazada.' };

  } catch (error) {
    console.error("Error en service rejectApplication:", error.message);
    throw new Error('Error al rechazar la solicitud.');
  }
};

export const getAllAnalysts = async () => {
  try {
    // Busca usuarios con el rol 'analist' y selecciona solo algunos campos
    const analysts = await User.find({ role: 'analist' }).select('username email createdAt lastLogin'); 
    if (!analysts) {
      return []; // Devuelve un array vacío si no se encuentran analistas
    }
    return analysts;
  } catch (error) {
    console.error("Error en service getAllAnalysts:", error.message);
    // Lanza un error que el controlador pueda manejar
    const serviceError = new Error('Error al obtener la lista de analistas.');
    serviceError.statusCode = 500;
    throw serviceError;
  }
};

export const revokeAnalystRole = async (userIdToRevoke, adminUserId) => {
  try {
    const user = await User.findById(userIdToRevoke);

    if (!user) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== 'analist') {
      const error = new Error('Este usuario no es un analista.');
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // Cambiar el rol a 'basic' (o tu rol por defecto)
    user.role = 'basic';
    await user.save();


    await AnalystApplication.findOneAndUpdate(
      { userId: userIdToRevoke, status: 'approved' },
      { status: 'revoked'} 
    );



    console.log(`Rol de analista revocado para el usuario ${user.username} (ID: ${userIdToRevoke}) por el admin ${adminUserId}`);
    return { success: true, message: `El rol de analista para '${user.username}' ha sido revocado correctamente.` };

  } catch (error) {
    console.error("Error en service revokeAnalystRole:", error.message);
    if (error.statusCode) {
      throw error; // Relanzar el error con su statusCode y mensaje originales
    }
    const serviceError = new Error('Error interno al revocar el rol de analista.');
    serviceError.statusCode = 500;
    throw serviceError;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find().select('username email role isActive createdAt lastLogin');
    return users;
  } catch (error) {
    console.error("Error en service getAllUsers:", error.message);
    throw new Error('Error al obtener la lista de usuarios.');
  }
};

export const softDeleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error en service softDeleteUser:", error.message);
    throw new Error('Error al desactivar el usuario.');
  }
};

export const hardDeleteUser = async (userId) => {
  try {
    const result = await User.findByIdAndDelete(userId);
    return result;
  } catch (error) {
    console.error("Error en service hardDeleteUser:", error.message);
    throw new Error('Error al eliminar el usuario.');
  }
};

export const reactivateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error en service reactivateUser:", error.message);
    throw new Error('Error al reactivar el usuario.');
  }
};

export const changeUserRole = async (userId, role) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error en service changeUserRole:", error.message);
    throw new Error('Error al cambiar el rol del usuario.');
  }
};