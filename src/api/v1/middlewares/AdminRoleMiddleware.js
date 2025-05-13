export const isAdmin = (req, res, next) => {

    if (!req.userTk) {
     return res.status(401).json({ message: 'No autorizado.' });
    }
  
    if (req.userTk.role !== 'admin') {
      console.warn(`Acceso denegado a ruta admin para usuario: ${req.userTk.username} (rol: ${req.userTk.role})`);
      return res.status(403).json({ message: 'Acción no permitida. Se requiere rol de administrador.' });
    }
  
    // Si es admin, continúa con la siguiente función (el controlador)
    next();
  };