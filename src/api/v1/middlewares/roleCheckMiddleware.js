
export const isAnalyst = (req, res, next) => {
    if (!req.userTk) {
      return res.status(401).json({ message: 'No autorizado, token no válido o faltante.' });
    }
  
    if (req.userTk.role !== 'analist') {
      return res.status(403).json({ message: 'Acción no permitida. Se requiere rol de analista.' });
    }
    next();
  };