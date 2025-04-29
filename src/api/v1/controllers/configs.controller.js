import { updateUsername } from '../services/configs.service.js';

export const changeUsername = async (req, res) => {
  try {
    const userId = req.userTk.id; // Obtener el userId del token
    const { newUsername } = req.body;

    if (!userId || !newUsername) {
      return res.status(400).json({ message: 'userId y newUsername son requeridos' });
    }

    const updatedUser = await updateUsername(userId, newUsername);

    res.status(200).json({
      message: 'Nombre actualizado correctamente',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
      }
    });
  } catch (error) {
    console.error('Error cambiando nombre:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Error del servidor'
    });
  }
};
