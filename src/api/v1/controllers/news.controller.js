import { fetchNews } from '../services/news.service.js';

export const getNews = async (req, res) => {
  try {
    const news = await fetchNews();
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    console.error('Error en getNews:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener las noticias' });
  }
};