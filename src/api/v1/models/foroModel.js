import mongoose from "mongoose";


const foroSchema = new mongoose.Schema({
  cryptoSymbol: { type: String, required: true },
  votosPositivos: { type: Number, default: 0 },
  totalVotos: { type: Number, default: 0 },
  comentarios: [{
    autor: { type: String, required: true },
    contenido: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Foro = mongoose.model('Foro', foroSchema);

