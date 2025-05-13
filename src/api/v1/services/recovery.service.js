import { User } from '../models/userModel.js';

import axios from 'axios';

export const generateResetPasswordToken = async (username) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Generar token
 
  const generateRandom6DigitNumber = () => {
    // Generate a random number between 100000 and 999999 (inclusive)
    return Math.floor(100000 + Math.random() * 900000);
  };
  
  const resetToken = generateRandom6DigitNumber();


  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

  await user.save();

  const resetLink = `https://notifinance-es.netlify.app/reset/${resetToken}`;

  
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #fff;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 15px rgba(255, 165, 0, 0.3);">
      
      <!-- Logo -->
      <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 150px; margin-bottom: 20px;">
  
      <h2 style="color: #ffa500;">🔒 Cambia tu Contraseña</h2>
      <p style="color: #333;">Hola <strong>${user.username}</strong>, hemos recibido una solicitud para cambiar tu contraseña. Si fuiste tú, haz clic en el siguiente botón para restablecer tu contraseña.</p>
      
      <!-- Botón para cambiar la contraseña -->
      <a href="${resetLink}" style="display: inline-block; background-color: #ffa500; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 20px;">
        Cambiar mi Contraseña
      </a>
  
      <p style="margin-top: 20px; color: #555;">Si no solicitaste este cambio, por favor ignora este mensaje.</p>
      <hr style="border: 1px solid #ffcc99;">
      <p style="font-size: 12px; color: #999;">© 2025 NotiFinance - Todos los derechos reservados.</p>
    </div>
  </div>
  `;
  

// Enviar el correo con el HTML usando la ruta /sendStyle
const emailSendUrl = `https://ntemail.onrender.com/sendStyle/${user.email}`;
const headers = {
Authorization: `Bearer NotifinanceTK`,
"Content-Type": "application/json"
};

// Enviar la solicitud con el contenido del correo
await axios.post(emailSendUrl, { content: htmlContent }, { headers });

return { message: "Correo de cambio de contraseña enviado." };

  
};

export const resetPasswordWithToken = async (token, newPassword) => {
    console.log(token);
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Token inválido o expirado');
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return true;
};
