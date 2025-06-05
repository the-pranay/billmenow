import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['razorpay', 'bank_transfer', 'cash', 'cheque', 'upi', 'card', 'wallet', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String,
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundDate: Date,
  refundReason: String,
  fees: {
    gatewayFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  netAmount: Number, // Amount after deducting fees
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledDate: Date
}, {
  timestamps: true
});

// Pre-save middleware to calculate net amount
paymentSchema.pre('save', function(next) {
  this.netAmount = this.amount - this.fees.totalFees;
  next();
});

// Indexes
paymentSchema.index({ userId: 1, invoiceId: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, paymentDate: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
