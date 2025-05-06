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

  // Obtener los detalles del plan (esto podría provenir de una base de datos o ser calculado dinámicamente)
  let price = 'someCalculatedPrice'; // Este es un ejemplo, deberías calcular el precio aquí dependiendo del plan
  if (plan === 'Freemium') {
    price = '0';  // Precio del plan Freemium
  } else if (plan === 'Premium') {
    price = '9.99'; // Precio del plan Premium
  } else if (plan === 'NotiFinance Pro') {
    price = '19,99'; // Precio del plan NotiFinance Pro
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
        price,        // Actualizamos el precio
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
