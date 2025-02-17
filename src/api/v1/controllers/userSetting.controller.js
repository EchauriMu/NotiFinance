import { getUserNotificationSettingsService } from '../services/userSetting.service';

// Controller para obtener la configuración de notificaciones
export const getUserNotificationSettings = async (req, res) => {
  try {
    const userId = req.userTk.id; // Extraer userId del token

    // Llamar al service para obtener la configuración
    const userSettings = await getUserNotificationSettingsService(userId);
    
    // Responder con éxito si se encuentra la configuración
    return res.status(200).json(userSettings);
  } catch (error) {
    console.error('Error en getUserNotificationSettings:', error);

    // Manejar error específico de "configuración no encontrada"
    if (error.message === 'CONFIG_NOT_FOUND') {
      return res.status(404).json({ message: 'Configuración de notificaciones no encontrada para este usuario' });
    }

    // Manejar errores internos
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
