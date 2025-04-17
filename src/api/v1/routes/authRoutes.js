import { Router } from 'express';
import { login, register,verifyEmailController } from '../controllers/auth.Controller'; // Importamos las funciones del controlador
import { authenticateToken } from '../middlewares/authMiddleware';
const router = Router();

// Definimos las rutas para login y registro
router.post('/login', login);  // Ruta para login
router.post('/register', register);  // Ruta para registro
router.post('/verify/:userId', verifyEmailController);  // Ruta para registro



// Ruta protegida, requiere autenticación
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Acceso permitido, bienvenido ${req.userTk.username}` });
  });
export default router;  // Usamos `export default` para exportar las rutas

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  // Limpiar la cookie de autenticación con las mismas opciones de seguridad que al crearla
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});