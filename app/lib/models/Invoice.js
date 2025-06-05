import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'razorpay', 'cash', 'cheque', 'other'],
    default: 'razorpay'
  },
  paymentLink: {
    type: String,
    trim: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    min: 0
  },
  paymentDate: Date,
  paymentTransactionId: String,
  sentDate: Date,
  viewedDate: Date,
  sentEmails: [{
    type: {
      type: String,
      enum: ['invoice', 'reminder', 'followup']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipientEmail: String
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String
  }],
  recurringInfo: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1
    },
    endDate: Date,
    nextInvoiceDate: Date,
    totalInvoices: {
      type: Number,
      min: 1
    },
    invoicesCreated: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate remaining amount
invoiceSchema.pre('save', function(next) {
  this.remainingAmount = this.total - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
    if (!this.paymentDate) {
      this.paymentDate = new Date();
    }
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  } else if (this.dueDate < new Date() && this.status !== 'paid') {
    this.status = 'overdue';
  }
  
  next();
});

// Indexes
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ userId: 1, clientId: 1 });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
