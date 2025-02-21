import mongoose from "mongoose";

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
