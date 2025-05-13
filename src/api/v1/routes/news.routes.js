import express from 'express';
import { getNews } from '../controllers/news.controller.js';

const router = express.Router();

// Ruta para obtener las noticias
router.get('/', getNews);

export default router;