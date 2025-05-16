import { generateResetPasswordToken, resetPasswordWithToken } from '../services/recovery.service.js';

export const requestPasswordReset = async (req, res) => {
  const { username } = req.body;

  try {
    await generateResetPasswordToken(username);
    res.status(200).json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {

  const { token, newPassword } = req.body;  // token y newPassword ahora provienen del body


  try {
    await resetPasswordWithToken(token, newPassword);
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const requestPasswordResetWithToken = async (req, res) => {
  // Obtiene el username desde el token
  const username = req.userTk?.username;

  if (!username) {
    return res.status(401).json({ message: 'Token inválido o no proporcionado' });
  }

  try {
    await generateResetPasswordToken(username);
    res.status(200).json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
