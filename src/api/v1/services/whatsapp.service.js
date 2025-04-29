import axios from 'axios';
// services/whatsapp.service.js
import { User } from '../models/userModel.js';

import { UserSettings } from '../models/notiModel.js'; // Asegúrate que esté bien la ruta

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    console.log(`Enviando mensaje a: ${phoneNumber}`);
    
    const url = `http://20.121.66.167:80/alert/${phoneNumber}`;
    const response = await axios.post(url, { content: message });
    
    console.log('Respuesta del servicio WhatsApp:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de WhatsApp:', error.message);
    throw new Error('No se pudo enviar el mensaje.');
  }
};




export const verifyPhoneCodeService = async (userId, code) => {
  const user = await User.findById(userId);

  if (!user) {
    return { success: false, message: 'Usuario no encontrado.' };
  }

  if (
    !user.phoneVerificationToken ||
    !user.phoneVerificationExpires ||
    user.phoneVerificationToken !== code
  ) {
    return { success: false, message: 'Código de verificación incorrecto.' };
  }

  if (user.phoneVerificationExpires < Date.now()) {
    return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
  }

  // ✅ Verificación correcta → Actualizar usuario
  user.isPoneVerified = true;
  user.phoneVerificationToken = null;
  user.phoneVerificationExpires = null;
  await user.save();

  // 🛠️ Actualizar o crear UserSettings con el número de WhatsApp formateado
  const whatsappUrl = `http://20.121.66.167:80/alert/+521${user.phone}`;

  const updatedSettings = await UserSettings.findOneAndUpdate(
    { userId },
    { 
      $set: { "notificationSettings.whatsapp": whatsappUrl },
      $setOnInsert: { watchlist: [] } // Si no existe, inicializa watchlist vacío
    },
    { new: true, upsert: true } // Crea si no existe
  );

  return { success: true };
};
