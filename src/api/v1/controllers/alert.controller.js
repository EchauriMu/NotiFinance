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
      return res.status(401).json({ message: "Token inválido o usuario no autenticado." });
    }

    const alerts = await alertService.getAlertById(userId);

    if (!alerts || alerts.length === 0) {
      return res.status(404).json({ message: "No se encontraron alertas para este usuario." });
    }

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    res.status(500).json({ message: "Error interno al obtener alertas", error: error.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener userId del token
    const alertData = { ...req.body, userId }; // Agregar userId a los datos de la alerta

    const newAlert = await alertService.createAlert(alertData);
    res.status(201).json(newAlert);
  } catch (error) {
    if (error.code === "NO_ALERT_SERVICE") {
      return res.status(403).json({ message: "El usuario no tiene el servicio de alertas activo", code: error.code });
    }
    res.status(500).json({ message: "Error al crear alerta", error });
  }
};



// Actualizar una alerta
export const updateAlert = async (req, res) => {
  try {
    const updatedAlert = await alertService.updateAlert(req.params.id, req.body);
    if (!updatedAlert) return res.status(404).json({ message: "Alerta no encontrada" });

    res.status(200).json(updatedAlert);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar alerta", error });
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
