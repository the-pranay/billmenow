import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxInfo: {
    taxId: String,
    gstNumber: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  defaultCurrency: {
    type: String,
    default: 'INR'
  },
  paymentTerms: {
    type: Number,
    default: 30 // days
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  totalInvoiced: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  totalOutstanding: {
    type: Number,
    default: 0
  },
  lastInvoiceDate: Date,
  lastPaymentDate: Date
}, {
  timestamps: true
});

// Indexes
clientSchema.index({ userId: 1, email: 1 }, { unique: true });
clientSchema.index({ userId: 1, name: 1 });
clientSchema.index({ userId: 1, company: 1 });
clientSchema.index({ createdAt: -1 });

export default mongoose.models.Client || mongoose.model('Client', clientSchema);
