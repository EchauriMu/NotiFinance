import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  cryptoSymbol: { // Símbolo de la criptomoneda (ej: BTC, ETH)
    type: String,
    required: [true, 'El símbolo de la criptomoneda es requerido'],
    uppercase: true, // Opcional: guardar siempre en mayúsculas
    trim: true,
  },
  predictionText: { // El texto/contenido de la predicción
    type: String,
    required: [true, 'El texto de la predicción es requerido'],
    trim: true,
  },
  analystId: { // ID del usuario analista que creó la predicción
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: true,
  },
  analystUsername: { // Nombre de usuario del analista (para mostrar fácilmente)
    type: String,
    required: true,
  },
  createdAt: { // Fecha de creación
    type: Date,
    default: Date.now,
  },
  updatedAt: { // Fecha de última actualización
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Mongoose manejará automáticamente createdAt y updatedAt
});

// Middleware para actualizar `updatedAt` antes de guardar (opcional si usas timestamps: true)
// predictionSchema.pre('save', function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Índice para buscar rápido por símbolo de cripto
predictionSchema.index({ cryptoSymbol: 1 });
// Índice para buscar rápido por analista
predictionSchema.index({ analystId: 1 });

export const Prediction = mongoose.model('Prediction', predictionSchema);