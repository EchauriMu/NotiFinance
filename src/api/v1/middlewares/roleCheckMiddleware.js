// src/api/v1/middlewares/roleCheckMiddleware.js

/**
 * Middleware para verificar si el usuario tiene el rol de 'analist'.
 * Debe usarse DESPUÉS de authenticateToken.
 */
export const isAnalyst = (req, res, next) => {
    // Asume que authenticateToken ya añadió req.userTk
    if (!req.userTk) {
      return res.status(401).json({ message: 'No autorizado, token no válido o faltante.' });
    }
  
    if (req.userTk.role !== 'analist') {
      return res.status(403).json({ message: 'Acción no permitida. Se requiere rol de analista.' });
    }
  
    // Si es analista, continúa con la siguiente función (el controlador)
    next();
  };
  
  // Podrías añadir más funciones si tuvieras otros roles: isAdmin, isBasic, etc.