const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

// @route   POST /api/donation/create-order
// @desc    Create a Razorpay order for donation
// @access  Private
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, notes } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid donation amount (minimum ₹1)'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-6)}`,
      notes: {
        userId: req.user._id.toString(),
        userName: req.user.name,
        userEmail: req.user.email,
        purpose: 'NGO Donation'
      }
    };

    const order = await razorpay.orders.create(options);

    // Create pending donation record (data saved regardless of payment outcome)
    const donation = new Donation({
      user: req.user._id,
      amount: amount,
      razorpayOrderId: order.id,
      status: 'pending',
      notes: notes || ''
    });

    await donation.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      donationId: donation._id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation order. Please try again.'
    });
  }
});

// @route   POST /api/donation/verify-payment
// @desc    Verify Razorpay payment signature and update donation status
// @access  Private
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      donationId 
    } = req.body;

    // Find the donation record
    const donation = await Donation.findOne({
      _id: donationId,
      user: req.user._id,
      razorpayOrderId: razorpay_order_id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    // Verify signature to ensure genuine payment
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is genuine - mark as success
      donation.status = 'success';
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature;
      donation.completedAt = new Date();
      
      await donation.save();

      res.json({
        success: true,
        message: 'Payment verified successfully! Thank you for your donation.',
        donation: {
          id: donation._id,
          amount: donation.amount,
          status: donation.status,
          receiptId: donation.receiptId
        }
      });
    } else {
      // Signature mismatch - possible fraud attempt
      donation.status = 'failed';
      donation.failureReason = 'Payment signature verification failed';
      await donation.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please contact support.'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support.'
    });
  }
});

// @route   POST /api/donation/payment-failed
// @desc    Handle failed payment
// @access  Private
router.post('/payment-failed', authenticateToken, async (req, res) => {
  try {
    const { donationId, razorpay_order_id, error_description } = req.body;

    const donation = await Donation.findOne({
      _id: donationId,
      user: req.user._id,
      razorpayOrderId: razorpay_order_id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    // Update donation status to failed
    donation.status = 'failed';
    donation.failureReason = error_description || 'Payment was cancelled or failed';
    await donation.save();

    res.json({
      success: true,
      message: 'Payment failure recorded',
      donation: {
        id: donation._id,
        status: donation.status
      }
    });
  } catch (error) {
    console.error('Payment failure handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment failure'
    });
  }
});

// @route   GET /api/donation/receipt/:id
// @desc    Get donation receipt
// @access  Private
router.get('/receipt/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'success'
    }).populate('user', 'name email phone address');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found or donation not completed'
      });
    }

    res.json({
      success: true,
      receipt: {
        receiptId: donation.receiptId,
        donorName: donation.user.name,
        donorEmail: donation.user.email,
        amount: donation.amount,
        currency: donation.currency,
        paymentId: donation.razorpayPaymentId,
        date: donation.completedAt,
        organization: 'NGO Name', // Replace with actual NGO name
        message: 'Thank you for your generous donation!'
      }
    });
  } catch (error) {
    console.error('Receipt fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt'
    });
  }
});

module.exports = router;
