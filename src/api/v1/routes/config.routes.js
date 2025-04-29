import { Router } from 'express';
import { changeUsername } from '../controllers/configs.controller.js';

const router = Router();

// Ruta para cambiar nombre
router.patch('/change-username', changeUsername);

export default router;
