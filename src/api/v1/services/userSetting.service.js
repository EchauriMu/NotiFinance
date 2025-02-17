import { UserSettings } from '../models/notiModel'; // Importar el modelo

// Función para obtener la configuración de notificaciones de un usuario
export const getUserNotificationSettingsService = async (userId) => {
  try {
    // Buscar la configuración de usuario en la base de datos
    const userSettings = await UserSettings.findOne({ userId }).lean();
    
    if (!userSettings) {
      throw new Error('CONFIG_NOT_FOUND'); // Código de error personalizado
    }

    return userSettings;
  } catch (error) {
    console.error('Error en getUserNotificationSettingsService:', error);
    throw error; // Lanzamos el error para que el controller lo maneje
  }
};
