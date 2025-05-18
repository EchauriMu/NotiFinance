import * as alertService from '../services/alert.service.js';

// Obtener todas las alertas
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getAllAlerts();
   
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener alertas", error });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const userId = req.userTk?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Token inválido o usuario no autenticado.",
        code: "MISSING_USER_ID"
      });
    }

    const alerts = await alertService.getAlertById(userId);

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error al obtener alertas:", error);

    if (error.code === "MISSING_USER_ID") {
      return res.status(401).json({
        message: "Token inválido o usuario no autenticado.",
        code: error.code
      });
    }

    if (error.code === "NONE_ALERTS") {
      return res.status(404).json({
        message: "No se encontraron alertas para el usuario.",
        code: error.code
      });
    }

    res.status(500).json({
      message: "Error interno al obtener alertas.",
      code: "GET_ALERTS_ERROR",
      error: error.message
    });
  }
};


export const createAlert = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener userId del token
    const username = req.userTk.username; // Obtener username del token
    const alertData = { ...req.body, userId, username }; // Agregar userId y username a los datos de la alerta

    const newAlert = await alertService.createAlert(alertData);
    res.status(201).json(newAlert);
  } catch (error) {
    if (error.code === "NO_ALERT_SERVICE") {
      return res.status(403).json({
        message: "El usuario no tiene el servicio de alertas activo",
        code: error.code,
      });
    }

    if (error.code === "LIMIT_ERROR") {
      return res.status(429).json({
        message: "Has alcanzado el límite de alertas permitido para tu plan",
        code: error.code,
      });
    }

    res.status(500).json({
      message: "Error al crear alerta",
      error,
    });
  }
};




export const changeIsActiveStatus = async (req, res) => {
  try {
    const { id, isActive } = req.body;

    // Validación de parámetros
    if (!id) {
      return res.status(400).json({ code: 'MISSING_ID', message: 'El campo id es requerido' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ code: 'INVALID_IS_ACTIVE', message: 'El campo isActive debe ser booleano' });
    }

    // Actualización de la alerta
    const updatedAlert = await alertService.updateAlertIsActive(id, isActive);

    if (!updatedAlert) {
      return res.status(404).json({ code: 'ALERT_NOT_FOUND', message: 'Alerta no encontrada' });
    }

    res.json({
      message: 'Estado actualizado correctamente',
      alert: updatedAlert
    });

  } catch (error) {
    // Manejo de errores internos
    console.error('Error en el controlador:', error);

    if (error.code === 'LIMIT_ERROR') {
      return res.status(400).json({
        code: 'LIMIT_ERROR',
        message: 'Ya alcanzaste el límite de alertas activas permitido en tu plan.'
      });
    }
    // Error genérico para otros casos
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Ha ocurrido un error interno. Intenta nuevamente más tarde.'
    });
  }
};

// Eliminar una alerta
export const deleteAlert = async (req, res) => {
  try {
    const deletedAlert = await alertService.deleteAlert(req.params.id);
    if (!deletedAlert) return res.status(404).json({ message: "Alerta no encontrada" });

    res.status(200).json({ message: "Alerta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar alerta", error });
  }
};
