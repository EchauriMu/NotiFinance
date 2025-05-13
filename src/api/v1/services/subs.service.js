import { Subscription } from '../models/subsModel.js';

// Obtener la suscripción activa por usuario
export const getSubscriptionByUserId = async (userId) => {
  return await Subscription.findOne({ user: userId });
};


// Servicio para actualizar la suscripción
export const updateSubscription = async (userId, subscriptionId, plan, last4, cvv, FC, autoRenew) => {
  // Verificar si el plan es válido (esto podría ir en una constante o en la base de datos)
  const validPlans = ['Freemium', 'Premium', 'NotiFinance Pro'];
  if (!validPlans.includes(plan)) {
    throw new Error('Plan especificado no es válido');
  }

  // Calcular la fecha de expiración (30 días desde la fecha actual)
  const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
  
  // Aquí asumimos que `autoRenew` se almacena en la base de datos como un campo booleano
  // Si no existe ese campo en la base de datos, necesitarías agregarlo a tu modelo de suscripción.
  
  // Buscar y actualizar la suscripción en la base de datos
  const updatedSubscription = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, user: userId },
    {
      $set: {
        plan,         // Actualizamos el plan
        status: 'active', 
        expiresAt: expirationDate, // Fecha de expiración
        last4,        // Últimos 4 dígitos de la tarjeta
        cvv,          // Código CVV de la tarjeta
        FC,           // Fecha de expiración de la tarjeta
        autoRenew,    // Estado de auto-renovación
      },
    },
    { new: true, runValidators: true } // `new` para devolver el documento actualizado
  );

  if (!updatedSubscription) {
    throw new Error('No se pudo actualizar la suscripción');
  }

  return updatedSubscription;
};


// Cancelar suscripción (marcar como 'canceled')
export const cancelSubscription = async (userId, subscriptionId) => {
  return await Subscription.findOneAndUpdate(
    { _id: subscriptionId, user: userId },
    { $set: { status: 'canceled', canceledAt: new Date() } },
    { new: true, runValidators: true }
  );
};



export const handlePlanChangeRequest = async (userId, newRequestedPlan, effectiveDate) => {
  if (!userId || !newRequestedPlan || !effectiveDate) {
    return { success: false, message: 'Faltan datos obligatorios' };
  }

  const allowedPlans = ['Freemium', 'Premium', 'NotiFinance Pro'];
  if (!allowedPlans.includes(newRequestedPlan)) {
    return { success: false, message: 'Plan solicitado no válido' };
  }

  const activeSub = await Subscription.findOne({ user: userId, status: 'active' });
  if (!activeSub) {
    return { success: false, message: 'Suscripción activa no encontrada' };
  }

  activeSub.planChangeRequested = true;
  activeSub.newRequestedPlan = newRequestedPlan;
  activeSub.planChangeEffectiveDate = new Date(effectiveDate);

  await activeSub.save();

  return { success: true, message: 'Cambio de plan solicitado correctamente', data: activeSub };
};
