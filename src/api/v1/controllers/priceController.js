const axios = require('axios');
const { getStockData } = require('../services/stockService');

// Variables globales
let lastPrice = null;           // Último precio notificado
const thresholdPrice = 720;     // Precio umbral para activar la notificación
const discordWebhookUrl = 'https://discord.com/api/webhooks/1329620430688092273/q4iexUQCIZnlgKqJuRR7o7CB4nsbNWqIqdhA3J4XQj-tBBXeuPWd-BzRCRbRlVJirDwv';

/**
 * Función que verifica el precio de la acción y envía una notificación si:
 *  - El precio supera el umbral definido.
 *  - El precio es diferente al último notificado.
 * La verificación se realiza cada 30 segundos (configurada en el server).
 */
const checkAndNotifyPrice = async () => {
  try {
    console.log('==================== INICIANDO VERIFICACIÓN DE PRECIO ====================');
    
    // Obtiene el precio actual de la acción
    const currentPrice = await getStockData();
    console.log(`Precio actual obtenido: $${currentPrice}`);
    
    // Verifica si el precio supera el umbral
    if (currentPrice > thresholdPrice) {
      // Si es la primera vez o el precio ha cambiado respecto al último notificado
      if (lastPrice === null || currentPrice !== lastPrice) {
        console.log(`El precio $${currentPrice} es mayor al umbral de $${thresholdPrice} y es diferente al último notificado.`);
        await sendDiscordNotification(currentPrice);
        lastPrice = currentPrice;  // Actualizamos el último precio notificado
      } else {
        console.log(`El precio $${currentPrice} es mayor al umbral, pero no ha cambiado desde el último notificado ($${lastPrice}). No se enviará mensaje.`);
      }
    } else {
      console.log(`El precio actual $${currentPrice} no supera el umbral de $${thresholdPrice}.`);
      // Opcional: Reiniciamos lastPrice si el precio cae por debajo del umbral,
      // para que al volver a superar el umbral se envíe un mensaje.
      lastPrice = null;
    }
    
    console.log('==================== FIN DE LA VERIFICACIÓN ====================\n');
  } catch (error) {
    console.error('Error al verificar el precio y enviar la notificación:', error.message);
  }
};

/**
 * Función que envía una notificación a Discord usando un webhook.
 * 
 * @param {number} price - El precio actual de la acción a incluir en la notificación.
 */
const sendDiscordNotification = async (price) => {
  try {
    console.log(`************** Enviando notificación a Discord con el precio: $${price} **************`);
    
    // Crea el mensaje que se enviará a Discord
    const message = {
      content: `La acción NVDA ha superado el umbral. El nuevo precio es $${price}.`
    };
    
    // Realiza la solicitud POST al webhook de Discord para enviar la notificación
    await axios.post(discordWebhookUrl, message);
    
    // Log vistoso para resaltar el envío exitoso
    console.log('\n🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
    console.log('🎉🎉 Notificación enviada a Discord exitosamente! 🎉🎉');
    console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀\n');
    
  } catch (error) {
    console.error('Error al enviar la notificación a Discord:', error.message);
  }
};

module.exports = { checkAndNotifyPrice };
