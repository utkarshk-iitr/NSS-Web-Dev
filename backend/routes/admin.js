const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, isAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total registrations
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

    // Get registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const donations = {
      total: 0,
      success: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 }
    };

    donationStats.forEach(stat => {
      donations.total += stat.count;
      donations[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
    });

    // Get recent donations (last 7 days)
    const recentDonationsAmount = await Donation.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRegistrations = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: today }
    });

    const todayDonations = await Donation.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        registrations: {
          total: totalUsers,
          active: activeUsers,
          recentWeek: recentRegistrations,
          today: todayRegistrations
        },
        donations: {
          ...donations,
          recentWeek: recentDonationsAmount[0] || { total: 0, count: 0 },
          today: todayDonations[0] || { total: 0, count: 0 }
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all registered users with filters
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    const query = { role: 'user' };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details with donation history
// @access  Private (Admin)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const donations = await Donation.find({ user: user._id })
      .sort({ createdAt: -1 });

    const donationStats = await Donation.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      user,
      donations,
      donationStats
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user details' 
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user active status
// @access  Private (Admin)
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
});

// @route   GET /api/admin/donations
// @desc    Get all donation records with filters
// @access  Private (Admin)
router.get('/donations', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    const query = {};

    // Status filter
    if (status && ['pending', 'success', 'failed'].includes(status)) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseInt(minAmount);
      if (maxAmount) query.amount.$lte = parseInt(maxAmount);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const donations = await Donation.find(query)
      .populate('user', 'name email phone')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    // Get aggregated stats for the filtered results
    const stats = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      donations,
      stats,
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

// @route   GET /api/admin/donations/:id
// @desc    Get specific donation details
// @access  Private (Admin)
router.get('/donations/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user', 'name email phone address');

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

// @route   GET /api/admin/export/users
// @desc    Export user registration data as JSON (can be converted to CSV on frontend)
// @access  Private (Admin)
router.get('/export/users', async (req, res) => {
  try {
    const { startDate, endDate, isActive } = req.query;
    const query = { role: 'user' };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query)
      .select('name email phone address isActive createdAt')
      .sort({ createdAt: -1 });

    // Format for export
    const exportData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || 'N/A',
      City: user.address?.city || 'N/A',
      State: user.address?.state || 'N/A',
      Status: user.isActive ? 'Active' : 'Inactive',
      'Registered On': user.createdAt.toISOString().split('T')[0]
    }));

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data' 
    });
  }
});

// @route   GET /api/admin/export/donations
// @desc    Export donation data
// @access  Private (Admin)
router.get('/export/donations', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const exportData = donations.map(d => ({
      'Receipt ID': d.receiptId || 'N/A',
      'Donor Name': d.user?.name || 'Unknown',
      'Donor Email': d.user?.email || 'Unknown',
      'Amount (₹)': d.amount,
      'Status': d.status.toUpperCase(),
      'Payment ID': d.razorpayPaymentId || 'N/A',
      'Attempted On': d.attemptedAt.toISOString().split('T')[0],
      'Completed On': d.completedAt ? d.completedAt.toISOString().split('T')[0] : 'N/A'
    }));

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data' 
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    // Daily registrations for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Daily donations for last 30 days
    const dailyDonations = await Donation.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Donation distribution by amount ranges
    const donationRanges = await Donation.aggregate([
      { $match: { status: 'success' } },
      {
        $bucket: {
          groupBy: '$amount',
          boundaries: [0, 100, 500, 1000, 5000, 10000, 50000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        dailyRegistrations,
        dailyDonations,
        donationRanges
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    });
  }
});

module.exports = router;
