
// services/ForoService.js
import {Foro} from "../models/foroModel.js";
// controllers/ForoController.js
import ForoService from "../services/Foro.service.js";

class ForoController {
  static async createForo(req, res) {
    try {
      cons
      const foro = await ForoService.createForo(req.body);
      res.status(201).json(foro);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getForoBySymbol(req, res) {
    const sym = req.params.symbol;
    console.log(sym);
    try {
      const foro = await ForoService.getForoBySymbol(sym);
      if (!foro) return res.status(404).json({ message: "Foro no encontrado" });
      res.json(foro);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addComentario(req, res) {
    try {
      const foro = await ForoService.addComentario(req.params.symbol, req.userTk.username, req.body);
      res.status(201).json(foro);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateForo(req, res) {
    try {
      const foro = await ForoService.updateForo(req.params.symbol, req.body);
      if (!foro) return res.status(404).json({ message: "Foro no encontrado" });
      res.json(foro);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteForo(req, res) {
    try {
      await ForoService.deleteForo(req.params.symbol);
      res.json({ message: "Foro eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }



// Crear un foro si no existe
static async inicializarForo (req, res) {
  const { symbol } = req.params;

  try {
    // Verificar si ya existe el foro
    let foro = await Foro.findOne({ cryptoSymbol: symbol });

    if (!foro) {
      // Si no existe, inicializamos el foro con valores predeterminados
      foro = new Foro({
        cryptoSymbol: symbol,
        votosPositivos: 0,
        totalVotos: 0,
        comentarios: []
      });

      // Guardamos el foro en la base de datos
      await foro.save();
      return res.status(201).json(foro); // Respondemos con el foro recién creado
    }

    // Si el foro ya existe, lo devolvemos tal cual
    res.status(200).json(foro);
  } catch (error) {
    console.error("Error al inicializar el foro:", error);
    res.status(500).json({ message: "Error al inicializar el foro" });
  }
};

}

export default ForoController;
