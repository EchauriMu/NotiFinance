import mongoose from 'mongoose';

// Esquema de alertas
const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: { type: String, required: true }, 
  cryptoSymbol: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  isFulfilled: { type: Boolean, default: false },
  typeNotification: {
    type: String,
    enum: ['discord', 'whatsapp', 'email'],
    required: true
  },
  notificationData: { type: String, required: true }, // URL o string del canal de notificación
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  condition: { type: String } //si borro esto se cae el servidor de revision y me da weba revisarlo xd
});

// Middleware para actualizar `updatedAt`
alertSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Alert = mongoose.model('Alert', alertSchema);
