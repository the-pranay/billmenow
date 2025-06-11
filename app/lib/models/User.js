import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['freelancer', 'small_business', 'agency', 'consultant', 'other'],
    default: 'freelancer'
  },
  phone: {
    type: String,
    trim: true
  },
  country: {
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
    gstNumber: String,
    panNumber: String
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branchName: String
  },
  preferences: {
    currency: {
      type: String,
      default: 'INR'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    emailNotifications: {
      invoiceCreated: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      paymentOverdue: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
      monthlyReport: { type: Boolean, default: true }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    paymentMethod: String,
    customerId: String // Razorpay customer ID
  },  settings: {
    // General Settings
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    
    // Notifications
    emailNotifications: {
      type: Boolean,
      default: true
    },
    invoiceReminders: {
      type: Boolean,
      default: true
    },
    paymentAlerts: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    
    // Security
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: String,
      default: '30'
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    
    // Invoice Settings
    autoSaveInvoices: {
      type: Boolean,
      default: true
    },
    defaultDueDate: {
      type: String,
      default: '30'
    },
    lateFeePercentage: {
      type: String,
      default: '2'
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: [String],
      default: ['7', '3', '1']
    },
    
    // Privacy
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    analyticsSharing: {
      type: Boolean,
      default: false
    },
    dataCollection: {
      type: String,
      enum: ['minimal', 'standard', 'enhanced'],
      default: 'minimal'
    }
  },
  emailTemplates: {
    invoice: {
      subject: {
        type: String,
        default: 'Invoice #{invoiceNumber} from {businessName}'
      },
      body: {
        type: String,
        default: `Dear {clientName},

I hope this email finds you well. Please find attached invoice #{invoiceNumber} for the services provided.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Amount: {amount}
• Due Date: {dueDate}
• Description: {description}

You can view and pay this invoice online using the link below:
{paymentLink}

If you have any questions about this invoice, please don't hesitate to reach out.

Thank you for your business!

Best regards,
{senderName}
{businessName}
{contactDetails}`
      }
    },
    reminder: {
      subject: {
        type: String,
        default: 'Payment Reminder: Invoice #{invoiceNumber} - Due {dueDate}'
      },
      body: {
        type: String,
        default: `Dear {clientName},

This is a friendly reminder that invoice #{invoiceNumber} is due for payment.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Amount: {amount}
• Due Date: {dueDate}
• Days Overdue: {daysOverdue}

You can quickly pay this invoice online using the secure link below:
{paymentLink}

Thank you for your prompt attention to this matter.

Best regards,
{senderName}
{businessName}
{contactDetails}`
      }
    },
    thankyou: {
      subject: {
        type: String,
        default: 'Payment Received - Thank You! Invoice #{invoiceNumber}'
      },
      body: {
        type: String,
        default: `Dear {clientName},

Thank you for your payment! I'm writing to confirm that we have received your payment for invoice #{invoiceNumber}.

Payment Details:
• Invoice Number: #{invoiceNumber}
• Amount Paid: {amount}
• Payment Date: {paymentDate}
• Transaction ID: {transactionId}

Best regards,
{senderName}
{businessName}
{contactDetails}`
      }
    },
    followup: {
      subject: {
        type: String,
        default: 'Following Up: Invoice #{invoiceNumber} - {daysOverdue} Days Overdue'
      },
      body: {
        type: String,
        default: `Dear {clientName},

I'm following up regarding invoice #{invoiceNumber}, which is now {daysOverdue} days overdue.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Original Amount: {amount}
• Due Date: {dueDate}
• Days Overdue: {daysOverdue}

Please contact me at your earliest convenience to discuss this further.

Best regards,
{senderName}
{businessName}
{contactDetails}`
      }
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for faster queries (email index already created by unique: true)
userSchema.index({ businessName: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
