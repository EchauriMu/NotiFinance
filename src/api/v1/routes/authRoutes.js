import { Router } from 'express';
import { login, register } from '../controllers/auth.Controller'; // Importamos las funciones del controlador
import { authenticateToken } from '../middlewares/authMiddleware';
const router = Router();

// Definimos las rutas para login y registro
router.post('/login', login);  // Ruta para login
router.post('/register', register);  // Ruta para registro


// Ruta protegida, requiere autenticación
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Acceso permitido, bienvenido ${req.userTk.username}` });
  });
export default router;  // Usamos `export default` para exportar las rutas
