import { Alert } from '../models/alertModel.js';
import { UserSettings } from '../models/notiModel'; 
import { Subscription } from '../models/subsModel.js';

export const createAlert = async (data) => {
  try {
    const { userId, typeNotification } = data;

    // Obtener la configuración de notificaciones del usuario
    const userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      const error = new Error();
      error.code = "NO_USER_SETTINGS";  // Enviar solo el código de error
      throw error;
    }

    const notificationData = userSettings.notificationSettings[typeNotification];
    if (notificationData === "") {
      const error = new Error();
      error.code = "NO_ALERT_SERVICE";  // Enviar solo el código de error
      throw error;
    }

    // Obtener la suscripción activa del usuario
    const subscription = await Subscription.findOne({ user: userId, status: 'active' });
    if (!subscription) {
      const error = new Error();
      error.code = "NO_ACTIVE_SUBSCRIPTION";  // Enviar solo el código de error
      throw error;
    }

    // Determinar el límite de alertas según el plan
    let alertLimit;
    switch (subscription.plan) {
      case 'Freemium':
        alertLimit = 3;
        break;
      case 'Premium':
        alertLimit = 10;
        break;
      case 'NotiFinance Pro':
        alertLimit = 20;
        break;
      default:
        const error = new Error();
        error.code = "UNKNOWN_PLAN";  // Enviar solo el código de error
        throw error;
    }

    // Verificar cuántas alertas tiene el usuario en total
    const totalAlerts = await Alert.countDocuments({ userId });
    if (totalAlerts >= alertLimit) {
      const error = new Error();
      error.code = "LIMIT_ERROR";  // Enviar solo el código de error
      throw error;
    }

    // Crear la nueva alerta (inactiva o activa según se reciba)
    const alertData = { ...data, notificationData };
    const newAlert = await Alert.create(alertData);

    return newAlert;

  } catch (error) {
    console.error("🚨 ERROR al crear alerta:", error);

 
    if (!error.code) {
      error.code = "INTERNAL_ERROR";  // Código genérico para errores internos
    }

    throw error;  // Lanzar solo el error con el código
  }
};



// Obtener todas las alertas
export const getAllAlerts = async () => {
  return await Alert.find();
};
// Obtener todas las alertas de un usuario por su ID
export const getAlertById = async (userId) => {
  if (!userId) {
    const error = new Error('Falta el ID del usuario.');
    error.code = 'MISSING_USER_ID';
    throw error;
  }

  try {
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });

    if (!alerts || alerts.length === 0) {
      const error = new Error('No se encontraron alertas para el usuario.');
      error.code = 'NONE_ALERTS';
      throw error;
    }

    const totalAlerts = alerts.length;

    // Añadir el total a cada alerta
    const alertsWithCount = alerts.map(alert => ({
      ...alert.toObject(),
      totalAlerts
    }));

    return alertsWithCount;
  } catch (err) {
    // Si ya tiene un código (como NONE_ALERTS), lo dejamos pasar tal cual
    if (err.code) throw err;

    // Otro tipo de error general
    const error = new Error('No se pudieron obtener las alertas del usuario.');
    error.code = 'GET_ALERTS_ERROR';
    throw error;
  }
};


// Actualizar una alerta
export const updateAlert = async (id, data) => {
  return await Alert.findByIdAndUpdate(id, data, { new: true });
};

// Eliminar una alerta
export const deleteAlert = async (id) => {
  return await Alert.findByIdAndDelete(id);
};
