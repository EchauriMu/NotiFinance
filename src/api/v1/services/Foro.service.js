
// services/ForoService.js
import {Foro} from "../models/foroModel.js";

class ForoService {
  static async createForo(data) {
    console.log(data);
    const foro = new Foro(data);
    return await foro.save();
  }

  static async getForoBySymbol(symbol) {
    console.log("Buscando foro con símbolo:", symbol);
    const foro = await Foro.findOne({ cryptoSymbol: symbol });
  
    if (!foro) {
      console.log("No se encontró foro en la base de datos.");
      return null;
    }
  
    return foro;
  }
  
  
  static async addComentario(symbol, username, { contenido, avatar }) {
    const foro = await Foro.findOne({ cryptoSymbol: symbol });
    if (!foro) throw new Error("Foro no encontrado");
    foro.comentarios.push({ autor: username, contenido, avatar, tiempo: "Justo ahora" });
    return await foro.save();
  }

  static async updateForo(symbol, data) {
    return await Foro.findOneAndUpdate({ cryptoSymbol: symbol }, data, { new: true });
  }

  static async deleteForo(symbol) {
    return await Foro.findOneAndDelete({ cryptoSymbol: symbol });
  }
}

export default ForoService;
