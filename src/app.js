// D:\ITTSPACE\backend\src\app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { mongoose } from './config/database.config';
import cookieParser from 'cookie-parser';

// Edu.v: imports Routes
import routeAPI from './api/v1/routes/index';
import config from './config/config';

import { getStockData } from './api/v1/services/stockService' // Importamos el servicio que obtiene el precio
import { checkAndNotifyPrice } from './api/v1/controllers/priceController'

const app = express();

app.set('port', config.PORT);

app.use(cookieParser());  // Asegúrate de usar cookie-parser en el backend para leer las cookies
app.set('trust proxy', 1); // Confía en el primer proxy

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173',  // Aquí colocamos el dominio de tu frontend
  credentials: true,  // Permite enviar cookies, tokens o encabezados de autenticación
};

// Aplicamos el middleware de CORS con las opciones configuradas
app.use(cors(corsOptions));

app.use(morgan('dev'));

// Aceptar JSONs
app.use(express.json({ limit: '11mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
routeAPI(app);

const api = config.API_URL;

app.get(`${api}`, (req, res) => {
  res.send(
    `<h1>RESTful running in root</h1> <p> KinderGarden: <b>${api}/api-docs</b> for more information.</p>`
  );
});

const startPriceMonitoring = async () => {
  console.log('Iniciando monitoreo de precios...');
  
  // Ejecuta inmediatamente la primera vez
  await checkAndNotifyPrice();

  setInterval(async () => {
    const now = new Date();
    const hours = now.getHours();

    // Verifica si está dentro del horario permitido (6 AM - 10 PM)
    if (hours >= 6 && hours <= 22) {
      console.log('Ejecutando verificación de precios...');
      await checkAndNotifyPrice();  // Llamamos al controlador para verificar el precio y enviar notificación si es necesario
    } else {
      console.log('⏳ Fuera del horario permitido (6 AM - 10 PM). No se verificará el precio.');
    }
  }, 30000);  // Ejecuta cada 120 segundos (2 minutos)
};


// Iniciar el monitoreo de precios
startPriceMonitoring();

// Middleware para el manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Errores!');
});

// Export App
export default app;
