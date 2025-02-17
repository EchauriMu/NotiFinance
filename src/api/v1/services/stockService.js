const axios = require('axios');

const getChainlinkPrice = async () => {
  try {
    // Obtener precio de Chainlink en USD
    const chainlinkResponse = await axios.get('https://api.twelvedata.com/quote', {
      params: {
        symbol: 'DOGE/USD',
        apikey: 'bcedf25a07df483c84a4d3225afefdbc'
      }
    });

    if (!chainlinkResponse.data || !chainlinkResponse.data.close) {
      throw new Error('La API de Twelve Data no devolvió un precio válido.');
    }

    const chainlinkPriceUSD = parseFloat(chainlinkResponse.data.close);
    console.log(`💰 Precio de DOGE en USD: $${chainlinkPriceUSD}`);

    // Multiplicar por 20.57 en lugar de consultar la API de conversión
    const conversionRate = 20.61;
    const chainlinkPriceMXN = chainlinkPriceUSD * conversionRate;
    
    console.log(`💵 Precio de Chainlink en MXN: $${chainlinkPriceMXN.toFixed(2)}`);
    return chainlinkPriceMXN;
  } catch (error) {
    console.error('❌ Error al obtener el precio de Chainlink:', error.message);
    throw error;
  }
};

module.exports = { getChainlinkPrice };
