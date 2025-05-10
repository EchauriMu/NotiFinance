import { getUserInfo, updateDiscordByUserId, removeNotificationDataAndAlerts } from '../services/user.service.js';
import * as userService from '../services/user.service.js';


export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userTk.id; 
    if (!userId) return res.status(400).json({ success: false, message: 'ID de usuario no válido' });

    const result = await getUserInfo(userId);

    console.log('Resultado de plan userinfo: ' + JSON.stringify(result));
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [UserController] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const postDiscordSetting = async (req, res) => {
  try {
    const userId = req.userTk.id;
    const { discord } = req.body;

    if (!discord) {
      return res.status(400).json({ message: "Discord ID is required" });
    }

    const result = await updateDiscordByUserId(userId, discord);
    res.status(200).json({ message: "Discord ID updated successfully", data: result });

  } catch (error) {
    console.error("Error updating Discord ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteNotificationType = async (req, res) => {
  const userId = req.userTk.id; // autenticación previa
  const { type } = req.body; // tipo de notificación: email, whatsapp o discord
  console.log("datos recibidos: ", userId +"tipo: " + type)
  try {
    const result = await removeNotificationDataAndAlerts(userId, type);
    res.status(200).json({
      message: `Datos y alertas de tipo "${type}" eliminados correctamente`,
      updatedSettings: result.updatedSettings,
      deletedAlerts: result.deletedAlerts
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const applyForAnalystRole = async (req, res) => {
  try {
    const userId = req.userTk.id; // ID del usuario autenticado
    const applicationData = req.body;

    // Validación básica (puedes añadir más con express-validator)
    if (!applicationData.motivation || !applicationData.experience) {
      return res.status(400).json({ message: 'El motivo y la experiencia son campos requeridos.' });
    }

    const result = await userService.submitAnalystApplication(userId, applicationData);
    res.status(200).json(result);

  } catch (error) {
    console.error("Error en controller applyForAnalystRole:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al procesar la solicitud.' });
  }
};