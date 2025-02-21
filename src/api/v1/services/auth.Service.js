// src/api/v1/services/authService.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel'; // Modelo de usuario
import config from '../../../config/config'; // Configuración para JWT
import { UserSettings } from '../models/notiModel'; 
import { Alert } from '../models/alertModel';
import { AlertHistory } from '../models/alertHistoryModel';


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


// Servicio de login
export const loginService = async (username, password) => {
  try {
    // Buscar al usuario en la base de datos y asegurarse de incluir el campo "password"
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      console.log('Usuario no encontrado');
      return null; // Usuario no existe
    }

    // Comparar la contraseña proporcionada con la almacenada (hasheada)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return null; // Contraseña incorrecta
    }

    // Generar un token JWT
    const token = generateToken(user);
    return token; // Retornamos el token
  } catch (error) {
    console.error('Error en loginService:', error.message);
    throw new Error('Error interno del servidor');
  }
};
// Servicio de registro
export const registerService = async (username, email, phone, password) => {
  try {
    // Verificar si el usuario ya existe (por username, email o teléfono)
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (existingUser) {
      return { error: 'El usuario ya existe con este email, teléfono o nombre de usuario.' };
    }

    // Formatear el número de teléfono al formato internacional
    const formattedPhone = formatPhoneNumber(phone);

    // Crear un nuevo usuario
    const newUser = new User({ username, email, phone: formattedPhone, password });
    // Guardar el usuario en la base de datos
    await newUser.save();

    // Crear configuraciones predeterminadas para el nuevo usuario
    const newUserSettings = new UserSettings({
      userId: newUser._id, // Asociamos el nuevo usuario
      notificationSettings: {
        email: true,    // Habilitar notificaciones por email por defecto
        whatsapp: false, // Deshabilitar WhatsApp por defecto
        discord: false,  // Deshabilitar Discord por defecto
      },
      watchlist: [] // Lista vacía por defecto
      // Las propiedades "alerts" y "alertHistory" se han eliminado ya que ahora son colecciones separadas.
    });
    // Guardar las configuraciones predeterminadas en la base de datos
    await newUserSettings.save();

    // Generar un token JWT para el nuevo usuario
    const token = generateToken(newUser);

    return {
      token,
      message: 'Usuario registrado exitosamente.',
    };
  } catch (error) {
    console.error('Error en registerService:', error.message);
    throw new Error('Error interno del servidor');
  }
};

// Función para formatear el número de teléfono a formato internacional (México)
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith('+')) {
    // Si no comienza con "+", asumimos que es un número nacional y le agregamos el código de país
    return `+52${phone}`; // Reemplaza "+52" con el código de país correspondiente si es necesario
  }
  return phone;
};