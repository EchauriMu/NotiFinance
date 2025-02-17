import mongoose from 'mongoose';

// Esquema de configuración del usuario
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationSettings: {
    email: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    discord: { type: Boolean, default: false }
  },
  watchlist: [{ 
    symbol: { type: String, required: true }
  }],
  alerts: [{
    cryptoSymbol: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    condition: { 
      type: Boolean, 
      required: true 
    }, // true = "por encima", false = "por debajo"
    isActive: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para actualizar la fecha de modificación
userSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
