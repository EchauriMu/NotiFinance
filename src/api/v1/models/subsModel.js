import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Freemium', 'Premium', 'NotiFinance Pro'],
    required: true
  },
  price: { type: String, required: true }, // Ej: "$9.99/mes"
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'trial'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    enum: ['creditCard', 'paypal', 'bankTransfer', 'none'],
    default: 'creditCard'
  },
  lastPaymentDate: {
    type: Date
  },
  nextBillingDate: {
    type: Date
  },
  canceledAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indice para encontrar rápido las suscripciones activas por usuario
subscriptionSchema.index({ user: 1, status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
