import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationSettings: {
    email: { type: String, default: "" }, // Guarda el correo electrónico o una cadena vacía
    whatsapp: { type: String, default: "" }, // Guarda el número de WhatsApp o una cadena vacía
    discord: { type: String, default: "" } // Guarda el ID de Discord o una cadena vacía
  },
  watchlist: [{ 
    symbol: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
