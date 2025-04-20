import axios from 'axios';
import { exec } from 'child_process';

// URLs y IPs de los servicios
const SERVICIOS = {
  'servicio de whatsapp y alertas': '172.178.51.229', // IP de la VM (servicio de whatsapp y alertas)
  'servicio de correo': 'https://ntemail.onrender.com/status',
  api_precios: 'https://api-twelve.onrender.com/'
};

// Función para hacer ping a la IP de la VM
export const pingHost = (host) => {
  return new Promise((resolve, reject) => {
    exec(`ping -c 1 ${host}`, (err, stdout, stderr) => {
      if (err) {
        resolve('Caído'); // Si no se puede hacer ping, lo devuelve como "Caído"
        return;
      }
      resolve('Operativo'); // Si el ping responde, se devuelve como "Operativo"
    });
  });
};

// Función para verificar el estado de un servicio web usando axios
export const checkStatus = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
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
  if (serviceName === 'servicio de whatsapp y alertas') {
    return await pingHost(SERVICIOS['servicio de whatsapp y alertas']); // Retorna el estado de "servicio de whatsapp y alertas" usando ping
  } else if (serviceName === 'servicio de correo') {
    return await checkStatus(SERVICIOS['servicio de correo']); // Retorna el estado de "servicio de correo" usando HTTP
  } else if (serviceName === 'api_precios') {
    return await checkStatus(SERVICIOS.api_precios); // Retorna el estado de "api_precios" usando HTTP
  } else {
    throw new Error('Servicio no reconocido'); // Si no se reconoce el nombre del servicio, se lanza un error
  }
};
