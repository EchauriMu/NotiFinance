import mongoose from 'mongoose';

// Esquema de alertas
const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cryptoSymbol: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  condition: { type: Boolean, required: true }, // true = "por encima", false = "por debajo"
  isActive: { type: Boolean, default: true },
  message: { type: String, default: '' },
  typeNotification: {
    type: String,
    enum: ['discord', 'whatsapp', 'email'],
    required: true
  },
  notificationData: { type: String, required: true }, // URL o string del canal de notificación
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para actualizar `updatedAt`
alertSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Alert = mongoose.model('Alert', alertSchema);
