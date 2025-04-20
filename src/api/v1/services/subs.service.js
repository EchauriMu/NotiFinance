import { Subscription } from '../models/subsModel.js';

// Obtener la suscripción activa por usuario
export const getSubscriptionByUserId = async (userId) => {
  return await Subscription.findOne({ user: userId, status: 'active' });
};

// Servicio para actualizar la suscripción
export const updateSubscription = async (userId, subscriptionId, plan) => {
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
  
    // Buscar y actualizar la suscripción en la base de datos
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, user: userId },
      {
        $set: {
          plan,
          price,
          expiresAt: expirationDate,
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
