import * as adminService from '../services/user.service.js'; // o admin.service.js si lo separaste
import { User } from '../models/userModel.js';
import axios from 'axios';

export const getPendingApplicationsHandler = async (req, res) => {
  try {
    const applications = await adminService.getPendingApplications();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Controller Error - getPendingApplicationsHandler:", error);
    res.status(500).json({ message: error.message || 'Error interno al obtener solicitudes.' });
  }
};

export const approveApplicationHandler = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminUserId = req.userTk.id; // ID del admin que realiza la acción

    const result = await adminService.approveApplication(applicationId, adminUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error - approveApplicationHandler:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al aprobar la solicitud.' });
  }
};

export const rejectApplicationHandler = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminUserId = req.userTk.id; // ID del admin que realiza la acción

    const result = await adminService.rejectApplication(applicationId, adminUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error - rejectApplicationHandler:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al rechazar la solicitud.' });
  }
};

export const getAllAnalystsHandler = async (req, res) => {
    try {
      const analysts = await adminService.getAllAnalysts();
      res.status(200).json(analysts);
    } catch (error) {
      console.error("Controller Error - getAllAnalystsHandler:", error.message);
      res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al obtener la lista de analistas.' });
    }
  };

  export const revokeAnalystRoleHandler = async (req, res) => {
    try {
      const { userId } = req.params; // El ID del usuario a revocar vendrá de los parámetros de la ruta
      const adminUserId = req.userTk.id; // ID del admin que realiza la acción (del token)
  
      if (!userId) {
        return res.status(400).json({ message: 'Se requiere el ID del usuario.' });
      }
  
      const result = await adminService.revokeAnalystRole(userId, adminUserId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Controller Error - revokeAnalystRoleHandler:", error.message);
      res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al revocar el rol de analista.' });
    }
  };

export const setAdminEmailHandler = async (req, res) => {
  try {
    const adminUserId = req.userTk.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo es requerido.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de correo inválido.' });
    }

    // Busca el usuario y verifica que sea admin
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    // Verifica si el correo ya está en uso por otro usuario
    const existing = await User.findOne({ email, _id: { $ne: adminUserId } });
    if (existing) {
      return res.status(400).json({ message: 'Este correo ya está en uso por otro usuario.' });
    }

    // Generar token de verificación y expiración
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Guarda el correo pendiente y el token, pero NO actualiza el email real
    adminUser.pendingEmail = email;
    adminUser.emailVerificationToken = emailVerificationToken;
    adminUser.emailVerificationExpires = emailVerificationExpires;

    await adminUser.save();

    // Enviar correo de verificación (igual que antes)
    const verificationUrl = `http://localhost:5173/verify-admin`;





    const emailSendURL = `https://ntemail.onrender.com/sendStyle/${encodeURIComponent(email)}`;
    const emailContent = `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #ffffff;">
  <div style="max-width: 520px; margin: auto; background: #ffffff; padding: 30px 25px; border-radius: 10px; box-shadow: 0 0 18px rgba(255, 165, 0, 0.2);">
    <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 140px; margin-bottom: 25px;">
    <h2 style="color: #ffa500; margin-bottom: 10px;">👋 ¡Verificación de correo!</h2>
    <p style="color: #444; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Para verificar tu correo de administrador, haz clic en el siguiente botón e ingresa el código que te mostramos abajo.
    </p>
    <a href="${verificationUrl}"
       style="display: inline-block; padding: 14px 28px; background-color: #ffa500; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0;">
      Ir a verificación
    </a>
    <p style="color: #444; font-size: 15px; margin-top: 25px;">
      Ingresa este código cuando se te solicite:
    </p>
    <div style="font-size: 28px; font-weight: bold; color: #ffa500; margin: 15px 0;">
      ${emailVerificationToken}
    </div>
    <p style="margin-top: 10px; color: #666; font-size: 14px;">
      Este código expirará en <strong>15 minutos</strong>. Si tú no solicitaste esta acción, puedes ignorar este mensaje.
    </p>
    <hr style="border: none; border-top: 1px solid #ffcc99; margin: 30px 0;">
    <p style="font-size: 12px; color: #999;">
      © 2025 NotiFinance · Todos los derechos reservados.
    </p>
  </div>
</div>
`;

    try {
      await axios.post(emailSendURL, { content: emailContent }, {
        headers: {
          Authorization: `Bearer NotifinanceTK`,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      return res.status(500).json({ message: 'No se pudo enviar el correo de verificación.' });
    }

    return res.status(200).json({
      message: 'Se ha enviado un token de verificación a tu nuevo correo. Debes confirmarlo antes de que se actualice.',
      pendingEmail: email
    });
  } catch (error) {
    console.error("Controller Error - setAdminEmailHandler:", error);
    res.status(500).json({ message: error.message || 'Error interno al actualizar el correo.' });
  }
};

export const verifyAdminEmailHandler = async (req, res) => {
  try {
    const adminUserId = req.userTk.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'El código de verificación es requerido.' });
    }

    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    if (
      !adminUser.emailVerificationToken ||
      !adminUser.emailVerificationExpires ||
      !adminUser.pendingEmail
    ) {
      return res.status(400).json({ message: 'No hay un correo pendiente de verificación.' });
    }

    if (
      adminUser.emailVerificationToken.toString() !== token.toString() ||
      adminUser.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Código inválido o expirado.' });
    }

    // Actualiza el correo y limpia los campos temporales
    adminUser.email = adminUser.pendingEmail;
    adminUser.pendingEmail = null;
    adminUser.emailVerificationToken = null;
    adminUser.emailVerificationExpires = null;
    await adminUser.save();

    return res.status(200).json({ message: 'Correo verificado y actualizado correctamente.' });
  } catch (error) {
    console.error("Controller Error - verifyAdminEmailHandler:", error);
    res.status(500).json({ message: error.message || 'Error interno al verificar el correo.' });
  }
};