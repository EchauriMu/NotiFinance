import { Router } from 'express';

import config from '../../../config/config';  // Configuración para el URL base


const routerAPI = (app) => {
  const router = Router();
  const api = config.API_URL;  // Obtener la URL base desde la configuración

  // Aplicamos el prefijo base a todas las rutas
  app.use(api, router);


  return router;
};

export default routerAPI;
