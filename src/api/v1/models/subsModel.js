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
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['creditCard', 'paypal', 'bankTransfer', 'none'],
    default: 'creditCard'
  },
  lastPaymentDate: {
    type: Date
  },
  canceledAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  last4: {
    type: String,
    default: null
  },
  cvv: {
    type: String,
    default: null
  },
  FC: {
    type: String,
    default: null
  },
  planChangeRequested: {
  type: Boolean,
  default: false
},
newRequestedPlan: {
  type: String,
  enum: ['Freemium', 'Premium', 'NotiFinance Pro'],
  default: null
},
planChangeEffectiveDate: {
  type: Date,
  default: null
}

});

// Indice para encontrar rápido las suscripciones activas por usuario
subscriptionSchema.index({ user: 1, status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
