import User from '../models/User.js';
import Scheme from '../models/Scheme.js';

// @desc    Get administrative dashboard statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSchemes = await Scheme.countDocuments();
    const activeSchemes = await Scheme.countDocuments({ status: 'Active' });
    const inactiveSchemes = await Scheme.countDocuments({ status: 'Inactive' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Aggregate total views
    const viewsAgg = await Scheme.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Fetch 6 most recently added schemes for overview panel
    const recentSchemes = await Scheme.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title department category status isActive createdAt viewCount');

    // Fetch 6 most recently registered users for overview panel
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name email role isBlocked state occupation createdAt');

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSchemes,
        activeSchemes,
        inactiveSchemes,
        adminCount,
        totalViews,
        totalApplications: Math.round(totalViews * 0.42)
      },
      recentSchemes,
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user list
// @route   GET /api/admin/users
// @access  Private / Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (user / admin)
// @route   PUT /api/admin/users/:userId/role
// @access  Private / Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be "user" or "admin".'
      });
    }

    // Safety policy: Admin cannot demote their own account role
    if (req.user._id.toString() === req.params.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: You cannot modify or demote your own admin account role.'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock status for citizen user
// @route   PATCH /api/admin/users/:userId/toggle-block
// @access  Private / Admin
export const toggleBlockUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Admin cannot block their own account.'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Admin accounts cannot be blocked. Only regular citizen accounts can be blocked.'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isBlocked ? 'blocked / suspended' : 'unblocked'}.`,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private / Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Safety policy: Admin cannot delete their own account
    if (req.user._id.toString() === req.params.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Admin accounts cannot delete their own account.'
      });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Cannot delete other Admin accounts.'
      });
    }

    await User.findByIdAndDelete(req.params.userId);

    return res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
