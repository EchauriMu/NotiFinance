import * as subscriptionService from '../services/subs.service.js';
// Controlador para actualizar la suscripción
// Controlador para actualizar la suscripción
export const update = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const { plan, last4, cvv, FC, autoRenew } = req.body; // Recibimos plan, last4, cvv, FC y autoRenew del cuerpo de la solicitud
    

    // Validar que el plan sea uno de los permitidos
    const validPlans = ['Freemium', 'Premium', 'NotiFinance Pro'];
    if (!validPlans.includes(plan)) {
      console.log('Plan no válido:', plan);
      return res.status(400).json({ error: 'Plan especificado no es válido' });
    }

    // Buscar la suscripción activa del usuario
    const currentSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    if (!currentSubscription) {
      console.log('No se encontró una suscripción activa para el usuario:', userId);
      return res.status(404).json({ error: 'No se encontró una suscripción activa para este usuario' });
    }

    // Llamar al servicio para actualizar la suscripción con los datos nuevos, incluyendo autoRenew
    const updatedSubscription = await subscriptionService.updateSubscription(
      userId,
      currentSubscription._id,
      plan,  // Plan recibido
      last4, // Últimos 4 dígitos de la tarjeta
      cvv,   // Código CVV
      FC,    // Fecha de expiración de la tarjeta
      autoRenew // Estado de auto-renovación
    );

    console.log('Suscripción actualizada:', updatedSubscription);
    return res.json(updatedSubscription);  // Devolver la suscripción actualizada
  } catch (error) {
    console.error('Error al actualizar la suscripción:', error);
    return res.status(500).json({ error: 'Error al actualizar la suscripción' });
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
    console.log('Suscripción activa:', subscription);
    
   if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found for the user' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAutoRenew = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const { autoRenew } = req.body; // Recibir el nuevo estado de auto-renovación

    // Validar que el valor de autoRenew sea booleano
    if (typeof autoRenew !== 'boolean') {
      return res.status(400).json({ error: 'El valor de autoRenew debe ser booleano (true o false)' });
    }

    // Buscar la suscripción activa del usuario
    const currentSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    if (!currentSubscription) {
      return res.status(404).json({ error: 'No se encontró una suscripción activa para este usuario' });
    }

    // Actualizar el estado de auto-renovación
    const updatedSubscription = await subscriptionService.updateAutoRenew(
      userId,
      currentSubscription._id,
      autoRenew
    );

    res.status(200).json({ message: 'Estado de auto-renovación actualizado correctamente', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error al actualizar el estado de auto-renovación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const requestPlanChange = async (req, res) => {
 const userId = req.userTk.id; // Obtener el userId del token
  const { newRequestedPlan, effectiveDate } = req.body;
console.log(req.body);
  try {
    const result = await subscriptionService.handlePlanChangeRequest(userId, newRequestedPlan, effectiveDate);
    if (result.success) {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    console.error('❌ Error en requestPlanChange:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
