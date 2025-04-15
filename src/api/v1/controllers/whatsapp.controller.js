import { sendWhatsAppMessage } from '../services/whatsapp.service.js';
// controllers/verificationController.js
import { verifyPhoneCodeService } from '../services/whatsapp.service.js';

import { User } from '../models/userModel.js';


export const sendVerificationMessage = async (req, res) => {
  try {
    console.log('Iniciando el proceso de verificación...');

    const userId = req.userTk.id;
    console.log('ID del usuario:', userId);

    const { phone } = req.body;
    console.log('Número de teléfono recibido:', phone);

    if (!phone || !/^\d{10}$/.test(phone)) {
      console.log('Número inválido:', phone);
      return res.status(400).json({ message: 'Número inválido. Deben ser 10 dígitos.' });
    }

    const fullNumber = `+521${phone}`;
    console.log('Número completo con prefijo internacional:', fullNumber);

    // 1. Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    // 2. Buscar al usuario y guardar la información en l abd
    const user = await User.findById(userId);
    if (!user) {
      console.log('Usuario no encontrado con ID:', userId);
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario encontrado:', user);

    user.phone = phone;
    user.phoneVerificationToken = verificationCode;
    user.phoneVerificationExpires = expiresAt;
    await user.save();
    console.log('Información de usuario actualizada en la base de datos.');

    // 3. Enviar el mensaje

    const message = `
🔐 *¡Tu código de verificación es!* 🔐

📲 Tu código único de verificación es: *${verificationCode}*

Este código es válido solo por un corto tiempo, así que úsalo rápidamente. ⏰

Si no has solicitado esta verificación, por favor ignora este mensaje. ❌

¡Gracias por usar nuestro servicio! 😄
`;

    console.log('Enviando mensaje a WhatsApp...');

    await sendWhatsAppMessage(fullNumber, message);

    console.log('Código enviado por WhatsApp.');
    res.status(200).json({ message: 'Código enviado por WhatsApp.' });
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error.message);
    res.status(500).json({ message: 'Error interno al enviar mensaje.', error: error.message });
  }
};




export const verifyPhoneCode = async (req, res) => {
  try {
    const userId = req.userTk.id;
    const { code } = req.body;

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Código inválido. Deben ser 6 dígitos.' });
    }

    const result = await verifyPhoneCodeService(userId, code);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: '✅ Teléfono verificado correctamente.' });
  } catch (error) {
    console.error('Error verificando el código:', error.message);
    res.status(500).json({ message: 'Error interno al verificar el código.' });
  }
};
