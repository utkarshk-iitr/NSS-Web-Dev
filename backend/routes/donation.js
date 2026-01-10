const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Cashfree API Configuration
const CASHFREE_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

// Check if Cashfree is configured
const isCashfreeConfigured = () => {
  return CASHFREE_APP_ID && 
         CASHFREE_SECRET_KEY && 
         !CASHFREE_APP_ID.includes('PASTE') &&
         CASHFREE_APP_ID.length > 10;
};

// Generate unique order ID
const generateOrderId = () => {
  return 'ORDER_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
};

// @route   GET /api/donation/config
// @desc    Get payment gateway configuration
// @access  Public
router.get('/config', (req, res) => {
  const configured = isCashfreeConfigured();
  res.json({
    configured,
    mockMode: !configured,
    gateway: 'cashfree',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    appId: configured ? CASHFREE_APP_ID : null
  });
});

// @route   POST /api/donation/create-order
// @desc    Create a Cashfree order for donation
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

    const orderId = generateOrderId();
    const orderAmount = parseFloat(amount).toFixed(2);

    let order;
    let mockMode = !isCashfreeConfigured();

    if (mockMode) {
      // MOCK MODE - Create fake order for testing
      console.log('⚠️  Running in MOCK mode - no real payments');
      order = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        order_status: 'ACTIVE',
        payment_session_id: 'mock_session_' + Date.now(),
        cf_order_id: 'mock_cf_' + Date.now()
      };
    } else {
      // LIVE MODE - Create real Cashfree order
      const orderPayload = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: req.user._id.toString(),
          customer_name: req.user.name,
          customer_email: req.user.email,
          customer_phone: req.user.phone || '9999999999'
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/status?order_id={order_id}`,
          notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/donation/webhook`
        },
        order_note: notes || 'NGO Donation'
      };

      const response = await axios.post(
        `${CASHFREE_API_URL}/orders`,
        orderPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY
          }
        }
      );

      order = response.data;
    }

    // Create pending donation record
    const donation = new Donation({
      user: req.user._id,
      amount: parseFloat(amount),
      razorpayOrderId: order.order_id,
      status: 'pending',
      notes: notes || ''
    });

    await donation.save();

    res.json({
      success: true,
      order: {
        orderId: order.order_id,
        orderAmount: order.order_amount,
        orderCurrency: order.order_currency || 'INR',
        paymentSessionId: order.payment_session_id,
        cfOrderId: order.cf_order_id
      },
      donationId: donation._id,
      mockMode,
      appId: mockMode ? 'mock_app_id' : CASHFREE_APP_ID
    });

  } catch (error) {
    console.error('Order creation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation order. Please try again.',
      error: error.response?.data?.message || error.message
    });
  }
});

// @route   POST /api/donation/verify-payment
// @desc    Verify Cashfree payment and update donation status
// @access  Private
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId, mockMode, mockStatus } = req.body;

    // Find the donation record
    const donation = await Donation.findOne({
      razorpayOrderId: orderId,
      user: req.user._id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    let paymentStatus = 'failed';
    let paymentDetails = null;

    if (mockMode) {
      // MOCK MODE - Simulate payment verification
      paymentStatus = mockStatus === 'success' ? 'success' : 'failed';
      paymentDetails = {
        cf_payment_id: 'mock_payment_' + Date.now(),
        payment_status: mockStatus === 'success' ? 'SUCCESS' : 'FAILED',
        payment_method: 'mock_upi'
      };
    } else {
      // LIVE MODE - Verify with Cashfree API
      try {
        const response = await axios.get(
          `${CASHFREE_API_URL}/orders/${orderId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-version': '2023-08-01',
              'x-client-id': CASHFREE_APP_ID,
              'x-client-secret': CASHFREE_SECRET_KEY
            }
          }
        );

        const orderData = response.data;
        
        if (orderData.order_status === 'PAID') {
          paymentStatus = 'success';
          
          // Get payment details
          const paymentsResponse = await axios.get(
            `${CASHFREE_API_URL}/orders/${orderId}/payments`,
            {
              headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY
              }
            }
          );

          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            paymentDetails = paymentsResponse.data[0];
          }
        }
      } catch (apiError) {
        console.error('Cashfree API error:', apiError.response?.data || apiError.message);
      }
    }

    if (paymentStatus === 'success') {
      donation.status = 'success';
      donation.razorpayPaymentId = paymentDetails?.cf_payment_id || 'cf_' + Date.now();
      // Convert payment_method object to string
      const paymentMethod = paymentDetails?.payment_method;
      donation.razorpaySignature = typeof paymentMethod === 'object' 
        ? JSON.stringify(paymentMethod) 
        : (paymentMethod || 'cashfree');
      donation.completedAt = new Date();
      donation.receiptId = 'RCPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
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
      donation.status = 'failed';
      donation.failureReason = 'Payment verification failed or was declined';
      await donation.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please try again.'
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
// @desc    Handle failed/cancelled payment
// @access  Private
router.post('/payment-failed', authenticateToken, async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const donation = await Donation.findOne({
      razorpayOrderId: orderId,
      user: req.user._id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    // Update donation status to failed
    donation.status = 'failed';
    donation.failureReason = reason || 'Payment was cancelled or failed';
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

// @route   POST /api/donation/webhook
// @desc    Cashfree webhook for payment notifications
// @access  Public (verified by signature)
router.post('/webhook', async (req, res) => {
  try {
    const { data, type } = req.body;
    
    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'ORDER_PAID_WEBHOOK') {
      const orderId = data?.order?.order_id;
      
      if (orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId });
        
        if (donation && donation.status === 'pending') {
          donation.status = 'success';
          donation.razorpayPaymentId = data?.payment?.cf_payment_id;
          donation.completedAt = new Date();
          donation.receiptId = donation.receiptId || 'RCPT_' + Date.now();
          await donation.save();
        }
      }
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
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
        orderId: donation.razorpayOrderId,
        date: donation.completedAt,
        organization: 'NGO Donation Portal',
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

// @route   GET /api/donation/check-status/:orderId
// @desc    Check payment status for an order
// @access  Private
router.get('/check-status/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const donation = await Donation.findOne({
      razorpayOrderId: orderId,
      user: req.user._id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If already processed, return current status
    if (donation.status !== 'pending') {
      return res.json({
        success: true,
        status: donation.status,
        donation: {
          id: donation._id,
          amount: donation.amount,
          receiptId: donation.receiptId
        }
      });
    }

    // For pending orders, check with Cashfree (if configured)
    if (isCashfreeConfigured()) {
      try {
        const response = await axios.get(
          `${CASHFREE_API_URL}/orders/${orderId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-version': '2023-08-01',
              'x-client-id': CASHFREE_APP_ID,
              'x-client-secret': CASHFREE_SECRET_KEY
            }
          }
        );

        if (response.data.order_status === 'PAID') {
          donation.status = 'success';
          donation.completedAt = new Date();
          donation.receiptId = 'RCPT_' + Date.now();
          await donation.save();
        }
      } catch (apiError) {
        console.error('Status check error:', apiError.message);
      }
    }

    res.json({
      success: true,
      status: donation.status,
      donation: {
        id: donation._id,
        amount: donation.amount,
        receiptId: donation.receiptId
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

module.exports = router;
