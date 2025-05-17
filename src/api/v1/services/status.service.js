import axios from 'axios';

// URLs y IPs de los servicios
const SERVICIOS = {
  'servicio de whatsapp': 'http://20.121.66.167', // IP pública de WhatsApp (Nginx)
  'servicio de alertas': 'http://40.71.211.95',   // IP pública de Alertas (Nginx)
  'servicio de correo': 'https://ntemail.onrender.com/status',
  api_precios: 'https://api-twelve-613d.onrender.com/status'
};

// Función para verificar el estado de un servicio web usando axios
export const checkStatus = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log('respuesta de ' + url + ':  ' + response.status);
    if (response.status >= 200 && response.status < 500) {
      return 'Operativo'; // Si la respuesta HTTP es exitosa, se devuelve "Operativo"
    } else {
      return 'Caído'; // Si el código de estado es 5xx o 4xx, se devuelve "Caído"
    }
  } catch (error) {
    return 'No disponible'; // Si hay un error al realizar la solicitud, se devuelve "No disponible"
  }
};

// Función para comprobar el estado de un servicio (uno por uno)
export const checkServiceStatus = async (serviceName) => {
  if (serviceName === 'servicio de whatsapp') {
    return await checkStatus(SERVICIOS['servicio de whatsapp']);
  } else if (serviceName === 'servicio de alertas') {
    return await checkStatus(SERVICIOS['servicio de alertas']);
  } else if (serviceName === 'servicio de correo') {
    return await checkStatus(SERVICIOS['servicio de correo']);
  } else if (serviceName === 'api_precios') {
    return await checkStatus(SERVICIOS.api_precios);
  } else {
    throw new Error('Servicio no reconocido'); // Si no se reconoce el nombre del servicio, se lanza un error
  }
};
