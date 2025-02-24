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

// Obtener una alerta por ID
export const getAlertById = async (req, res) => {
  try {
    const alert = await alertService.getAlertById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alerta no encontrada" });

    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener alerta", error });
  }
};

// Crear una alerta (userId desde req.userTk.id)
export const createAlert = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener userId del token
    const alertData = { ...req.body, userId }; // Agregar userId a los datos de la alerta

    const newAlert = await alertService.createAlert(alertData);
    res.status(201).json(newAlert);
  } catch (error) {
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
