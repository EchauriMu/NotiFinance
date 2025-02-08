const axios = require('axios');

/**
 * Función para obtener los datos de la acción de Meta desde la API de Twelve Data.
 * Se obtiene el precio de cierre más reciente.
 * 
 * @returns {Promise<number>} El último precio de cierre de la acción de Meta.
 */
const getStockData = async () => {
  // URL base de la API de Twelve Data
  const url = 'https://api.twelvedata.com/time_series';
  
  // Parámetros de la solicitud: 
  // símbolo de la acción (META), intervalo (1 minuto), clave API y zona horaria.
  const params = {
    symbol: 'META', // Cambiado a la acción de Meta
    interval: '1min',
    apikey: 'e02c4efdc3994bcea6d15a6758f0ca6d',
    timezone: 'America/Mexico_City'
  };

  try {
    // Realiza la solicitud GET a la API de Twelve Data
    const response = await axios.get(url, { params });
    
    // Extrae los valores de la respuesta
    const { values } = response.data;
    
    // Verifica que la respuesta contenga datos
    if (values && values.length > 0) {
      // Obtiene el primer valor, que es el más reciente (última acción)
      const latestData = values[0];
      
      // Retorna el precio de cierre convertido a número
      return parseFloat(latestData.close);
    } else {
      throw new Error('No se encontraron datos disponibles');
    }
  } catch (error) {
    // Muestra un error si algo sale mal con la solicitud
    console.error('Error al obtener los datos de la acción de Meta:', error.message);
    throw error;
  }
};

module.exports = { getStockData };
