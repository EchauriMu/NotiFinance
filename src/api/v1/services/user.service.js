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
      twitterURL: applicationData.twitterURL,
      otherPublicProfileURL: applicationData.otherPublicProfileURL,
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

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/notifinance.mx@gmail.com`;
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
    const email = user.email;
    if (!user) {
      // Manejar caso raro donde el usuario ya no existe
      console.warn(`Usuario ${application.userId} no encontrado al aprobar solicitud ${applicationId}`);
      return { success: true, message: 'Solicitud aprobada, pero el usuario no fue encontrado.' };
    }
    user.role = 'analist'; // Cambia el rol a analista
    await user.save();

    const subject = `Hola, ${user.username}, tu solicitud ha sido aprobada`;
    const emailContent = `
      <p>Tu solicitud para ser analista ha sido aprobada.</p>
      <p>Ahora puedes acceder a todas las funcionalidades de analista.</p>
      <p>¡Bienvenido al equipo de NotiFinance!</p>
    `;

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/${email}`;
    const headers = {
        Authorization: `Bearer NotifinanceTK`,
        "Content-Type": "application/json"
      };

    await axios.post(emailSendURL, { content: emailContent, subject: subject }, { headers }); // Añade el subject

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

    const user = await User.findById(application.userId);
    const email = user.email;

    // Actualiza el estado de la solicitud
    application.status = 'rejected';
    application.reviewedBy = adminUserId;
    application.reviewedAt = new Date();
    await application.save();

    const subject = `Hola, ${user.username}, lamentablemente tu solicitud para ser analista ha sido rechazada`;
    const emailContent = `
      <p>Hola ${user.username},</p>
      <p>Tu solicitud para ser analista ha sido rechazada.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>Si deseas volver a intentarlo, asegúrate de cumplir con los requisitos necesarios.</p>
      <p>¡Gracias por tu interés en ser parte de nuestro equipo!</p>
    `;

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/${email}`;
    const headers = {
        Authorization: `Bearer NotifinanceTK`,
        "Content-Type": "application/json"
      };

    await axios.post(emailSendURL, { content: emailContent, subject: subject }, { headers }); // Añade el subject

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
    const email = user.email;

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

    const subject = `Hola, ${user.username}, lamentablemente tu rol de analista ha sido revocado`;
    const emailContent = `
      <p>Hola ${user.username},</p>
      <p>Tu rol de analista ha sido revocado por el administrador.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>Si deseas volver a intentarlo, asegúrate de cumplir con los requisitos necesarios y seguir las normas establecidas.</p>
      <p>Tu rol ha sido cambiado a 'basic'.</p>
    `;

    const emailSendURL = `https://ntemail.onrender.com/sendStyle/${email}`;
    const headers = {
        Authorization: `Bearer NotifinanceTK`,
        "Content-Type": "application/json"
      };

    await axios.post(emailSendURL, { content: emailContent, subject: subject }, { headers }); // Añade el subject
    
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
    if (user) {
      await sendUserDeletedEmail(user.email, user.username, "desactivada");
    }
    return user;
  } catch (error) {
    console.error("Error en service softDeleteUser:", error.message);
    throw new Error('Error al desactivar el usuario.');
  }
};

export const hardDeleteUser = async (userId) => {
  try {
    // Buscar usuario antes de eliminar para obtener email y username
    const user = await User.findById(userId);
    if (user) {
      await sendUserDeletedEmail(user.email, user.username, "eliminada");
    }
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
    if (user) {
      await sendUserReactivatedEmail(user.email, user.username);
    }
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

async function sendUserDeletedEmail(email, username, tipo = "eliminada") {
  const subject = `Tu cuenta ha sido ${tipo === "eliminada" ? "eliminada" : "desactivada"} en NotiFinance`;
  const htmlContent = `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #ffffff;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px 25px; border-radius: 10px; box-shadow: 0 0 15px rgba(255, 0, 0, 0.12);">
    <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 140px; margin-bottom: 25px;">
    <h2 style="color: #ff4d4f; margin-bottom: 10px;">${tipo === "eliminada" ? "⚠️ Cuenta eliminada" : "⚠️ Cuenta desactivada"}</h2>
    <p style="color: #444; font-size: 16px; margin-bottom: 15px;">
      Hola <strong>${username}</strong>,<br>
      Tu cuenta ha sido ${tipo === "eliminada" ? "eliminada" : "desactivada"} por el equipo de NotiFinance.
    </p>
    <p style="color: #444; font-size: 15px; margin-bottom: 25px;">
      Si crees que esto es un error o necesitas más información, por favor <a href="mailto:notifinance.mx@gmail.com" style="color: #ffa500; text-decoration: none;">contáctanos</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #ffcc99; margin: 30px 0;">
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      © 2025 NotiFinance · Todos los derechos reservados.
    </p>
  </div>
</div>
  `;
  const emailSendUrl = `https://ntemail.onrender.com/sendStyle/${email}`;
  const headers = {
    Authorization: `Bearer NotifinanceTK`,
    "Content-Type": "application/json"
  };
  try {
    await axios.post(emailSendUrl, { content: htmlContent, subject }, { headers });
  } catch (err) {
    console.error("❌ Error enviando correo de eliminación:", err.message);
  }
}

async function sendUserReactivatedEmail(email, username) {
  const subject = "¡Tu cuenta ha sido reactivada en NotiFinance!";
  const htmlContent = `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #ffffff;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px 25px; border-radius: 10px; box-shadow: 0 0 15px rgba(82, 196, 26, 0.12);">
    <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 140px; margin-bottom: 25px;">
    <h2 style="color: #52c41a; margin-bottom: 10px;">✅ Cuenta reactivada</h2>
    <p style="color: #444; font-size: 16px; margin-bottom: 15px;">
      Hola <strong>${username}</strong>,<br>
      ¡Tu cuenta ha sido reactivada exitosamente! Ya puedes volver a acceder a todos los servicios de NotiFinance.
    </p>
    <p style="color: #444; font-size: 15px; margin-bottom: 25px;">
      Si tienes alguna pregunta, por favor <a href="mailto:notifinance.mx@gmail.com" style="color: #ffa500; text-decoration: none;">contáctanos</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #b7eb8f; margin: 30px 0;">
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      © 2025 NotiFinance · Todos los derechos reservados.
    </p>
  </div>
</div>
  `;
  const emailSendUrl = `https://ntemail.onrender.com/sendStyle/${email}`;
  const headers = {
    Authorization: `Bearer NotifinanceTK`,
    "Content-Type": "application/json"
  };
  try {
    await axios.post(emailSendUrl, { content: htmlContent, subject }, { headers });
  } catch (err) {
    console.error("❌ Error enviando correo de reactivación:", err.message);
  }
}