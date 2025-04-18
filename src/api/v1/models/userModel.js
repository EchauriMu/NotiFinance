import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['pro', 'basic', 'premium', 'analist'], 
    default: 'basic', 
    required: true 
  },
  phone: { type: String, required: false, unique: true },
  phoneVerificationToken: { type: String, default: null },
  phoneVerificationExpires: { type: Date, default: null },
  emailVerificationToken: { type: String, default: null },
emailVerificationExpires: { type: Date, default: null },
  isPoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para actualizar la fecha de actualización
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para hashear la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar la contraseña
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Exportar el modelo
export const User = mongoose.model('User', userSchema);
