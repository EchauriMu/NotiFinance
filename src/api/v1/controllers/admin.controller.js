import * as adminService from '../services/user.service.js'; // o admin.service.js si lo separaste

export const getPendingApplicationsHandler = async (req, res) => {
  try {
    const applications = await adminService.getPendingApplications();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Controller Error - getPendingApplicationsHandler:", error);
    res.status(500).json({ message: error.message || 'Error interno al obtener solicitudes.' });
  }
};

export const approveApplicationHandler = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminUserId = req.userTk.id; // ID del admin que realiza la acción

    const result = await adminService.approveApplication(applicationId, adminUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error - approveApplicationHandler:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al aprobar la solicitud.' });
  }
};

export const rejectApplicationHandler = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminUserId = req.userTk.id; // ID del admin que realiza la acción

    const result = await adminService.rejectApplication(applicationId, adminUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error - rejectApplicationHandler:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al rechazar la solicitud.' });
  }
};

export const getAllAnalystsHandler = async (req, res) => {
    try {
      const analysts = await adminService.getAllAnalysts();
      res.status(200).json(analysts);
    } catch (error) {
      console.error("Controller Error - getAllAnalystsHandler:", error.message);
      res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al obtener la lista de analistas.' });
    }
  };

  export const revokeAnalystRoleHandler = async (req, res) => {
    try {
      const { userId } = req.params; // El ID del usuario a revocar vendrá de los parámetros de la ruta
      const adminUserId = req.userTk.id; // ID del admin que realiza la acción (del token)
  
      if (!userId) {
        return res.status(400).json({ message: 'Se requiere el ID del usuario.' });
      }
  
      const result = await adminService.revokeAnalystRole(userId, adminUserId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Controller Error - revokeAnalystRoleHandler:", error.message);
      res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al revocar el rol de analista.' });
    }
  };