import axios from 'axios';

export const fetchNews = async () => {
  const apiKey = '0dd7938f6dae463182cd6c10067517df'; 
  const url = 'https://newsapi.org/v2/everything';

  try {
    const response = await axios.get(url, {
      params: {
        q: 'cryptocurrency', // Búsqueda de noticias sobre criptomonedas
        pageSize: 40,        // Número de noticias que quieres obtener
        apiKey: apiKey       // Tu clave de API
      }
    });

    // Retornamos los artículos en el formato deseado
    return response.data.articles.map((article) => ({
      title: article.title,
      description: article.description,
      link: article.url,
      image_url: article.urlToImage
    }));
  } catch (error) {
    console.error('Error al cargar las noticias:', error.message);
    throw new Error('Error al cargar las noticias');
  }
};