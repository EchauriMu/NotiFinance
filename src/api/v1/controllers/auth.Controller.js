// src/api/v1/controllers/authController.js
import { loginService, registerService } from '../services/auth.Service';

// Lógica para el login de usuario
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const token = await loginService(username, password);

    if (!token) {
      return res.status(404).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Configuramos la cookie de autenticación con opciones de seguridad
    res.cookie('authToken', token, {
      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'Lax', // Permite el envío de la cookie en solicitudes entre dominios
      maxAge: 3600000, // La cookie expira en 1 hora (3600000 ms)
    });

    return res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el controlador de login:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Lógica para el registro de usuario
export const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // Llamamos al servicio de registro
    const result = await registerService(username, email, phone, password);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json({ message: result.message, token: result.token });
  } catch (error) {
    console.error('Error en el controlador de registro:', error.message);
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};
