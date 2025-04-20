import * as subscriptionService from '../services/subs.service.js';

// Controlador para actualizar la suscripción
export const update = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const { plan } = req.body;    // El plan será pasado en el cuerpo de la solicitud
    
    console.log('Datos recibidos en el backend:', req.body); // Depuración de lo que llega

    const validPlans = ['Freemium', 'Premium', 'NotiFinance Pro'];
    if (!validPlans.includes(plan)) {
      console.log('Plan no válido:', plan);
      return res.status(400).json({ error: 'Plan especificado no es válido' });
    }

    const currentSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    if (!currentSubscription) {
      console.log('No se encontró una suscripción activa para el usuario:', userId);
      return res.status(404).json({ error: 'No se encontró una suscripción activa para este usuario' });
    }

    // Llamar al servicio para actualizar la suscripción
    const updatedSubscription = await subscriptionService.updateSubscription(userId, currentSubscription._id, plan);

    console.log('Suscripción actualizada:', updatedSubscription);
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error al actualizar la suscripción:', error);
    res.status(500).json({ error: 'Error al actualizar la suscripción' });
  }
};


// Función para cancelar la suscripción
export const cancel = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const currentSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    
    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found for the user' });
    }

    // Marcar la suscripción como cancelada
    const canceledSubscription = await subscriptionService.cancelSubscription(userId, currentSubscription._id);
    res.json({ message: 'Subscription canceled', subscription: canceledSubscription });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener la suscripción activa de un usuario
export const getActiveSubscription = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const subscription = await subscriptionService.getSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found for the user' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
