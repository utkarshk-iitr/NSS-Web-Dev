const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile with registration details
// @access  Private (User)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private (User)
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional({ values: 'falsy' }).isMobilePhone().withMessage('Please enter a valid phone number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get the first error message
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({ 
        success: false, 
        message: errorMessages[0],
        errors: errors.array() 
      });
    }

    const { name, phone, address } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// @route   GET /api/user/donations
// @desc    Get user's donation history
// @access  Private (User)
router.get('/donations', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (status && ['pending', 'success', 'failed'].includes(status)) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    // Calculate statistics
    const stats = await Donation.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const donationStats = {
      total: 0,
      success: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      donationStats[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
      donationStats.total += stat.count;
    });

    res.json({
      success: true,
      donations,
      stats: donationStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Donations fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch donations' 
    });
  }
});

// @route   GET /api/user/donations/:id
// @desc    Get specific donation details
// @access  Private (User)
router.get('/donations/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Donation fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch donation details' 
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard summary
// @access  Private (User)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent donations
    const recentDonations = await Donation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalDonations: 0,
      successfulDonations: 0,
      pendingDonations: 0,
      failedDonations: 0,
      totalAmountDonated: 0
    };

    donationStats.forEach(stat => {
      stats.totalDonations += stat.count;
      if (stat._id === 'success') {
        stats.successfulDonations = stat.count;
        stats.totalAmountDonated = stat.totalAmount;
      } else if (stat._id === 'pending') {
        stats.pendingDonations = stat.count;
      } else if (stat._id === 'failed') {
        stats.failedDonations = stat.count;
      }
    });

    res.json({
      success: true,
      user,
      stats,
      recentDonations
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data' 
    });
  }
});

module.exports = router;
