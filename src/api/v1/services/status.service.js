import axios from 'axios';
import { exec } from 'child_process';

// URLs y IPs de los servicios
const SERVICIOS = {
  notificaciones: '172.178.51.229', // IP de la VM
  notifinance: 'https://ntemail.onrender.com/status',
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
  if (serviceName === 'notificaciones') {
    return await pingHost(SERVICIOS.notificaciones); // Retorna el estado de "notificaciones" usando ping
  } else if (serviceName === 'notifinance') {
    return await checkStatus(SERVICIOS.notifinance); // Retorna el estado de "notifinance" usando HTTP
  } else if (serviceName === 'api_precios') {
    return await checkStatus(SERVICIOS.api_precios); // Retorna el estado de "api_precios" usando HTTP
  } else {
    throw new Error('Servicio no reconocido'); // Si no se reconoce el nombre del servicio, se lanza un error
  }
};
