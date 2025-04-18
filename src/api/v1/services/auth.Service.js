// src/api/v1/services/authService.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel'; // Modelo de usuario
import config from '../../../config/config'; // Configuración para JWT
import { UserSettings } from '../models/notiModel'; 
import { Alert } from '../models/alertModel';
import { AlertHistory } from '../models/alertHistoryModel';
import axios from 'axios';


// Función para generar un token JWT
// Función para generar un token JWT
const generateToken = (userData) => {
  const payload = {
    id: userData._id,
    username: userData.username,
    role: userData.role,
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' }); // Token válido por 1 hora
};


export const loginService = async (username, password) => {
  try {
    const user = await User.findOne({ username }).select("+password +isActive");

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return { error: "Usuario no encontrado", status: 401 }; // ⬅️ Devolver código 401
    }

    if (!user.isActive) {
      console.log("⚠️ Cuenta inactiva. Verifica tu correo antes de iniciar sesión.");
      return { error: "Cuenta inactiva. Verifica tu correo antes de iniciar sesión.", status: 401 };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Contraseña incorrecta");
      return { error: "Contraseña incorrecta", status: 401 };
    }

    const token = generateToken(user);
    return { token, status: 200 }; // ⬅️ Devolver éxito con código 200
  } catch (error) {
    console.error("❌ Error en loginService:", error.message);
    throw new Error("Error interno del servidor");
  }
};



// Función para formatear el número de teléfono a formato internacional (México)
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    return `+52${phone}`;
  }
  return phone;
};

// Función para generar un token numérico de 6 dígitos
const generateEmailVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Función para enviar el correo de verificación usando la API sendStyle (HTML)
const sendVerificationEmail = async (email, username, token, userId) => {
  const verificationUrl = `http://localhost:5173/verify/${userId}`;
  // Endpoint para enviar emails estilizados (HTML)
  const emailSendURL = `https://ntemail.onrender.com/sendStyle/${encodeURIComponent(email)}`;

  // Construir el contenido HTML del correo
  const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hola ${username},</h2>
      <p>Gracias por registrarte. Para verificar tu cuenta, usa el siguiente código:</p>
      <h3 style="color: #007bff;">${token}</h3>
      <p>haz clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
         Verificar mi cuenta
      </a>
      <p>Este código expirará en <strong>15 minutos</strong>.</p>
    </div>
  `;

  try {
    const headers = {
      Authorization: `Bearer NotifinanceTK`,
      "Content-Type": "application/json"
    };
    
    const response = await axios.post(emailSendURL, { content: emailContent }, { headers });
    

    console.log("✅ Email verification sent:", response.data);
    return true;
  } catch (err) {
    console.error("❌ Error enviando email de verificación:", err.message);
    return false;
  }
};

// Servicio de registro
export const registerService = async (username, email, password) => {
  try {
    // Verificar si el usuario ya existe (por username, email o teléfono)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.isActive) {
        return { error: "Este usuario ya está registrado y activado." };
      }

      // Si el token aún es válido (no expiró), no permitir reenviar
      if (existingUser.emailVerificationExpires > Date.now()) {
        return {
          error: "Ya se ha enviado un correo de verificación. Espera a que expire o verifica tu cuenta.",
        };
      }

      // Si el token ha expirado, generar uno nuevo y actualizar
      const newEmailVerificationToken = generateEmailVerificationToken();
      const newEmailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

      existingUser.emailVerificationToken = newEmailVerificationToken;
      existingUser.emailVerificationExpires = newEmailVerificationExpires;
      await existingUser.save();

      // Reenviar el correo con el nuevo token (usando sendStyle para HTML)
      const emailSent = await sendVerificationEmail(
        email,
        username,
        newEmailVerificationToken,
        existingUser._id
      );
      if (!emailSent) {
        return { error: "No se pudo reenviar el correo de verificación. Intenta nuevamente." };
      }

      return { message: "Tu token de verificación ha expirado. Se ha enviado uno nuevo a tu correo." };
    }

    // Si el usuario no existe, proceder con el registro normal
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);


    const newUser = new User({
      username,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
    });
    await newUser.save();


    const newUserSettings = new UserSettings({
      userId: newUser._id,
      notificationSettings: {
        email: "", // Se guarda la URL de la API de alertas
        whatsapp: "",
        discord: "",
      },
      watchlist: [],
    });
    await newUserSettings.save();

    // Enviar correo de verificación (usando sendStyle para HTML)
    const emailSent = await sendVerificationEmail(
      email,
      username,
      emailVerificationToken,
      newUser._id
    );
    if (!emailSent) {
      return { error: "No se pudo enviar el correo de verificación. Intenta nuevamente." };
    }

    return {
      message: "Usuario registrado exitosamente. Se ha enviado un token de verificación a tu correo.",
    };
  } catch (error) {
    console.error("❌ Error en registerService:", error.message);
    throw new Error("Error interno del servidor");
  }
};











export const verifyEmailService = async (userId, token) => {
  try {
    // Buscar usuario por ID
    const user = await User.findById(userId);

    if (!user) return { error: "Usuario no encontrado." };
    if (user.emailVerificationToken !== token) return { error: "El token es inválido." };
    if (user.emailVerificationExpires < new Date()) return { error: "El token ha expirado. Solicita uno nuevo." };

    // Activar usuario
    user.isActive = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Guardar la URL sin encodeURIComponent
    const emailApiUrl = `https://ntemail.onrender.com/alert/${user.email}`;
    await UserSettings.findOneAndUpdate(
      { userId: user._id },
      { $set: { "notificationSettings.email": emailApiUrl } }, // Guardamos la URL directamente sin encode
      { new: true, upsert: true }
    );

    // HTML para el correo de confirmación
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50;">🎉 ¡Verificación Exitosa!</h2>
          <p style="color: #555;">Hola <strong>${user.username}</strong>, tu cuenta ha sido verificada correctamente.</p>
          <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
          <hr style="border: 1px solid #ddd;">
          <p style="color: #777;">Si no fuiste tú, por favor contáctanos inmediatamente.</p>
          <p style="margin-top: 10px; font-size: 12px; color: #999;">© 2025 NotiFinance - Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    // Enviar el correo con el HTML usando la ruta /sendStyle
    const emailSendUrl = `https://ntemail.onrender.com/sendStyle/${user.email}`;
    const headers = {
      Authorization: `Bearer NotifinanceTK`,
      "Content-Type": "application/json"
    };
    
    await axios.post(emailSendUrl, { content: htmlContent }, { headers });
    

    return { message: "Correo de verificación enviado y usuario activado." };
  } catch (error) {
    console.error("❌ Error en verifyEmailService:", error.message);
    throw new Error("Error interno del servidor.");
  }
};
