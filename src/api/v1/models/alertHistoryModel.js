import mongoose from "mongoose";


const alertHistorySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cryptoSymbol: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    condition: { type: Boolean, required: true }, // true = "por encima", false = "por debajo"
    message: { type: String, required: true },
    triggeredAt: { type: Date, default: Date.now },
    isResolved: { type: Boolean, default: false },
    resolutionMessage: { type: String, default: '' },
    isNotified: { type: Boolean, default: false }
  });
  
  export const AlertHistory = mongoose.model('AlertHistory', alertHistorySchema);
  