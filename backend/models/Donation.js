const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Minimum donation amount is ₹1']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  // Additional tracking fields
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  // Transaction metadata
  notes: {
    type: String,
    default: ''
  },
  // For record keeping
  receiptId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate receipt ID before saving successful donation
donationSchema.pre('save', function(next) {
  if (this.status === 'success' && !this.receiptId) {
    this.receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.completedAt = new Date();
  }
  next();
});

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Enable virtuals in JSON
donationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Donation', donationSchema);
