

// controllers/ForoController.js
import ForoService from "../services/Foro.service.js";

class ForoController {
  static async createForo(req, res) {
    try {
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
}

export default ForoController;
