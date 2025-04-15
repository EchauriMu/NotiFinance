const axios = require('axios');
const { getChainlinkPrice } = require('../services/stockService');

// Variable global para recordar el último precio notificado
let lastPrice = null;

// Definimos el umbral en MXN (único valor, por ejemplo, 380 MXN)
const thresholdPrice = 5.0; 

// URL del webhook de Discord
const discordWebhookUrl = 'https://discord.com/api/webhooks/1329620430688092273/q4iexUQCIZnlgKqJuRR7o7CB4nsbNWqIqdhA3J4XQj-tBBXeuPWd-BzRCRbRlVJirDwv';


const checkAndNotifyPrice = async () => {
  try {
    console.log('==================== INICIANDO VERIFICACIÓN DE PRECIO ====================');
    
    // Obtiene el precio actual de Chainlink en MXN
    const currentPrice = await getChainlinkPrice();
    console.log(`Precio actual de Chainlink: $${currentPrice.toFixed(2)} MXN`);
    
    // Si el precio supera el umbral y es distinto al último notificado, se envía la notificación
    if (currentPrice < thresholdPrice) {
      if (lastPrice === null || currentPrice !== lastPrice) {
        console.log(`El precio $${currentPrice.toFixed(2)} MXN esta en umbral de $${thresholdPrice} MXN y es diferente al último notificado.`);
        await sendDiscordNotification(currentPrice);
        lastPrice = currentPrice;
      } else {
        console.log(`El precio $${currentPrice.toFixed(2)} MXN es mayor al umbral, pero no ha cambiado desde el último notificado ($${lastPrice.toFixed(2)} MXN).`);
      }
    } else {
      console.log(`El precio actual $${currentPrice.toFixed(2)} MXN no esta el umbral de $${thresholdPrice} MXN.`);
      lastPrice = null;
    }
    
    console.log('==================== FIN DE LA VERIFICACIÓN ====================\n');
  } catch (error) {
    console.error('Error al verificar el precio y enviar la notificación:', error.message);
  }
};

/**
 * Función que envía una notificación a Discord con el precio recibido.
 * @param {number} price - Precio actual en MXN
 */
const sendDiscordNotification = async (price) => {
  try {
    console.log(`************** Enviando notificación a Discord con el precio: $${price.toFixed(2)} MXN **************`);
    
    const message = {
      content: `🔗 Chainlink ha superado el umbral. El nuevo precio es $${price.toFixed(2)} MXN.`
    };
    
    await axios.post(discordWebhookUrl, message);
    
    console.log('\n🚀🚀🚀 Notificación enviada a Discord exitosamente! 🚀🚀🚀\n');
    
  } catch (error) {
    console.error('Error al enviar la notificación a Discord:', error.message);
  }
};

module.exports = { checkAndNotifyPrice };
