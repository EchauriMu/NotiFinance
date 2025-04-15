// src/api/v1/controllers/authController.js
import { loginService, registerService, verifyEmailService } from '../services/auth.Service';
// Lógica para el login de usuario
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
    }

    const result = await loginService(username, password);

    // Verifica si hubo un error en loginService
    if (result.error) {
      return res.status(result.status || 401).json({ message: result.error });
    }

  // Configuramos la cookie de autenticación con opciones de seguridad para producción
res.cookie("authToken", result.token, {
  httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
  secure: true, // Requiere HTTPS en producción
  sameSite: "None", // Permite compartir cookies entre diferentes dominios
  maxAge: 3600000, // Expira en 1 hora (3600000 ms)

});

    return res.json({ message: "Inicio de sesión exitoso", token: result.token });
  } catch (error) {
    console.error("❌ Error en el controlador de login:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};


// Lógica para el registro de usuario
export const register = async (req, res) => {
  try {
    const { username, password, email} = req.body;

    // Llamamos al servicio de registro
    const result = await registerService(username, email, password);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json({ message: result.message, token: result.token });
  } catch (error) {
    console.error('Error en el controlador de registro:', error.message);
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { userId } = req.params; // Obtener userId desde la URL
    const { token } = req.body; // Obtener el token desde el cuerpo de la petición

    if (!userId || !token) {
      return res.status(400).json({ error: "UserId y token son requeridos." });
    }

    const result = await verifyEmailService(userId, token);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error en verifyEmailController:", error.message);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};
