import * as serviceStatus from '../services/status.service.js';

// Controlador para obtener el estado de los servicios
export const getServicesStatus = async (req, res) => {
  try {
    // Llamamos al servicio para obtener el estado de cada uno
    const servicioWhatsappAlertasStatus = await serviceStatus.checkServiceStatus('servicio de whatsapp y alertas');
    const servicioCorreoStatus = await serviceStatus.checkServiceStatus('servicio de correo');
    const apiPreciosStatus = await serviceStatus.checkServiceStatus('api_precios');

    // Enviar los estados de los servicios como un objeto
    const result = {
      'servicio de whatsapp y alertas': servicioWhatsappAlertasStatus,
      'servicio de correo': servicioCorreoStatus,
      api_precios: apiPreciosStatus
    };

    console.log(result);


    // Devolver los estados de los servicios como respuesta en formato JSON
    res.json(result);
  } catch (error) {
    console.error('Error al obtener el estado de los servicios:', error);
    res.status(500).json({ error: 'Hubo un problema al verificar los servicios' });
  }
};
