// src/api/v1/services/authService.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel'; // Modelo de usuario
import config from '../../../config/config'; // Configuración para JWT
import { UserSettings } from '../models/notiModel'; 
import { Alert } from '../models/alertModel';
import { AlertHistory } from '../models/alertHistoryModel';
import { Subscription } from '../models/subsModel';
import axios from 'axios';


// Función para generar un token JWT
const generateToken = (userData, plan) => {
  const payload = {
    id: userData._id,
    username: userData.username,
    role: userData.role,
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '3h' }); // Token válido por 1 hora
};

export const loginService = async (username, password) => {
  try {
    const user = await User.findOne({ username }).select("+password +isActive");

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return { error: "Usuario no encontrado", status: 401 };
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

    const token = generateToken(user); // ← Eliminado el segundo parámetro (userPlan)
    return { token, user: { id: user._id, username: user.username, role: user.role }, status: 200 };
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

const emailContent = `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #ffffff;">
  <div style="max-width: 520px; margin: auto; background: #ffffff; padding: 30px 25px; border-radius: 10px; box-shadow: 0 0 18px rgba(255, 165, 0, 0.2);">

    <!-- Logo -->
    <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 140px; margin-bottom: 25px;">

    <!-- Título -->
    <h2 style="color: #ffa500; margin-bottom: 10px;">👋 ¡Bienvenido, ${username}!</h2>

    <!-- Mensaje principal -->
    <p style="color: #444; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Gracias por registrarte en <strong>NotiFinance</strong>. Para verificar tu cuenta, haz clic en el siguiente botón e ingresa el código que te mostramos abajo.
    </p>

    <!-- Botón de verificación -->
    <a href="${verificationUrl}"
       style="display: inline-block; padding: 14px 28px; background-color: #ffa500; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0;">
      Ir a verificación
    </a>

    <!-- Código de verificación -->
    <p style="color: #444; font-size: 15px; margin-top: 25px;">
      Ingresa este código cuando se te solicite:
    </p>
    <div style="font-size: 28px; font-weight: bold; color: #ffa500; margin: 15px 0;">
      ${token}
    </div>

    <p style="margin-top: 10px; color: #666; font-size: 14px;">
      Este código expirará en <strong>15 minutos</strong>. Si tú no solicitaste esta acción, puedes ignorar este mensaje.
    </p>

    <hr style="border: none; border-top: 1px solid #ffcc99; margin: 30px 0;">

    <p style="font-size: 12px; color: #999;">
      © 2025 NotiFinance · Todos los derechos reservados.
    </p>
  </div>
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


export const registerService = async (username, email, password) => {
  try {
    // Verificar si el usuario ya existe (por username, email o teléfono)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.isActive) {
        return { error: "Este nombre usuario o correo electronico ya está registrado y activado." };
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
    
    // Crear suscripción Freemium por defecto
    // Calcular fecha de expiración (1 año por defecto para plan Freemium)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    const newSubscription = new Subscription({
      user: newUser._id,
      plan: 'Freemium',
      price: "$0.00/mes",
      status: 'active',
      expiresAt: expiresAt,
      paymentMethod: 'none',
      nextBillingDate: expiresAt
    });
    await newSubscription.save();
    
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
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #ffffff;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px 25px; border-radius: 10px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);">

    <!-- Logo -->
    <img src="https://itt0resources.blob.core.windows.net/notifinance/1.png" alt="NotiFinance" style="max-width: 140px; margin-bottom: 25px;">

    <!-- Título -->
    <h2 style="color: #ffa500; margin-bottom: 10px;">🎉 ¡Verificación Exitosa!</h2>

    <!-- Mensaje -->
    <p style="color: #444; font-size: 16px; margin-bottom: 15px;">
      Hola <strong>${user.username}</strong>, tu cuenta ha sido verificada correctamente.
    </p>

    <p style="color: #444; font-size: 15px; margin-bottom: 25px;">
      Ahora puedes acceder a todas las funciones de <strong>NotiFinance</strong> sin restricciones.
    </p>

    <hr style="border: none; border-top: 1px solid #ffcc99; margin: 30px 0;">

    <p style="color: #777; font-size: 14px;">
      Si no realizaste esta acción, por favor <a href="mailto:notifinance.mx@gmail.com" style="color: #ffa500; text-decoration: none;">contáctanos de inmediato</a>.
    </p>

    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      © 2025 NotiFinance · Todos los derechos reservados.
    </p>
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
