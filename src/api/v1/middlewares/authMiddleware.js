import jwt from 'jsonwebtoken';
import config from '../../../config/config';  // Importa la clave secreta desde la configuración

const SECRET_KEY = config.JWT_SECRET;  // Utilizamos la clave secreta desde la configuración

// Middleware para verificar el token en solicitudes protegidas
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;  // Obtener el token desde las cookies

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token no encontrado' });
  }

  // Verificar el token usando la clave secreta
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    req.user = user.username;  // Agregar el usuario al objeto de la solicitud
    req.instituteId = user.instituteId._id; // Asegúrate de pasar el instituteId al request
 
    next();  // Continuar con la solicitud
  });
};
