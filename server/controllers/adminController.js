import mongoose from 'mongoose';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import ActivityLog from '../models/ActivityLog.js';
import { logActivity, pruneActivityLogs } from '../utils/activityLogger.js';

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
    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    // Recent Schemes (last 5)
    const recentSchemes = await Scheme.find().sort({ createdAt: -1 }).limit(5);

    // Recent Users (last 5)
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    // Aggregate category distribution for charts
    const categoryDistribution = await Scheme.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$category', 'General Welfare'] },
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'Active'] },
                    { $eq: ['$status', 'active'] },
                    { $eq: ['$status', 'ACTIVE'] },
                    { $eq: ['$isActive', true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          inactive: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'Inactive'] },
                    { $eq: ['$status', 'inactive'] },
                    { $eq: ['$status', 'INACTIVE'] },
                    { $eq: ['$isActive', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSchemes,
        activeSchemes,
        inactiveSchemes,
        adminCount,
        citizenCount: totalUsers - adminCount,
        totalViews,
        totalApplications: Math.round(totalViews * 0.42),
        categoryDistribution
      },
      recentSchemes,
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system activity logs (strictly max 20 records)
// @route   GET /api/admin/logs
// @access  Private / Admin
export const getLogs = async (req, res, next) => {
  try {
    // Ensure strict 20 retention in database
    await pruneActivityLogs(20);

    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);
    const logs = await ActivityLog.find().sort({ createdAt: -1, _id: -1 }).limit(limit);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user list with search, role filter, status filter, sorting & pagination
// @route   GET /api/admin/users
// @access  Private / Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    const { search, role, status, isBlocked, sortBy, sortOrder } = req.query;

    const andConditions = [];

    // Role filter
    if (role && role !== 'all' && role.toLowerCase() !== 'all') {
      andConditions.push({ role: role.toLowerCase() });
    }

    // Status filter (Active / Blocked)
    if (status && status !== 'all' && status.toLowerCase() !== 'all') {
      if (status.toLowerCase() === 'active') {
        andConditions.push({ $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }] });
      } else if (status.toLowerCase() === 'blocked') {
        andConditions.push({ isBlocked: true });
      }
    } else if (isBlocked !== undefined && isBlocked !== '') {
      andConditions.push({ isBlocked: isBlocked === 'true' || isBlocked === true });
    }

    // Search query across name, email, state, occupation
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      andConditions.push({
        $or: [
          { name: regex },
          { email: regex },
          { state: regex },
          { occupation: regex }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Dynamic Sorting
    const sortConfig = {};
    const normalizedSortBy = (sortBy || 'newest').toLowerCase();
    const orderDirection = (sortOrder || '').toLowerCase() === 'asc' ? 1 : -1;

    if (normalizedSortBy === 'name_asc' || normalizedSortBy === 'a-z' || (normalizedSortBy === 'name' && orderDirection === 1)) {
      sortConfig.name = 1;
    } else if (normalizedSortBy === 'name_desc' || normalizedSortBy === 'z-a' || (normalizedSortBy === 'name' && orderDirection === -1)) {
      sortConfig.name = -1;
    } else if (normalizedSortBy === 'email_asc' || (normalizedSortBy === 'email' && orderDirection === 1)) {
      sortConfig.email = 1;
    } else if (normalizedSortBy === 'email_desc' || (normalizedSortBy === 'email' && orderDirection === -1)) {
      sortConfig.email = -1;
    } else if (normalizedSortBy === 'role' || normalizedSortBy === 'role_asc') {
      sortConfig.role = orderDirection === -1 && normalizedSortBy === 'role' ? -1 : 1;
    } else if (normalizedSortBy === 'status' || normalizedSortBy === 'isblocked') {
      sortConfig.isBlocked = orderDirection;
    } else if (normalizedSortBy === 'oldest' || normalizedSortBy === 'created_asc' || (normalizedSortBy === 'createdat' && orderDirection === 1)) {
      sortConfig.createdAt = 1;
    } else {
      // Default: Newest first
      sortConfig.createdAt = -1;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .collation({ locale: 'en', strength: 2 })
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
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
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided identifier.'
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be "user" or "admin".'
      });
    }

    // Safety policy: Admin cannot demote their own account role
    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: You cannot modify or demote your own admin account role.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'UPDATE USER ROLE',
      user: req.user,
      details: `Admin "${adminName}" changed role of "${user.name}" (${user.email}) to ${role}.`
    });

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
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided identifier.'
      });
    }

    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Admin cannot block their own account.'
      });
    }

    const user = await User.findById(userId);
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

    const previousStatus = user.isBlocked ? 'BLOCKED' : 'ACTIVE';
    const newStatus = user.isBlocked ? 'ACTIVE' : 'BLOCKED';

    user.isBlocked = !user.isBlocked;
    user.status = user.isBlocked ? 'blocked' : 'active';
    await user.save();

    await logActivity({
      action: user.isBlocked ? 'BLOCK USER' : 'UNBLOCK USER',
      user: req.user,
      details: `Admin '${req.user.name}' changed status of User '${user.name}' from '${previousStatus}' to '${newStatus}'.`,
      meta: {
        admin: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        action: user.isBlocked ? 'BLOCK USER' : 'UNBLOCK USER',
        previousStatus,
        newStatus,
        timestamp: new Date()
      }
    });

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
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided identifier.'
      });
    }

    // Safety policy: Admin cannot delete their own account
    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy: Admin accounts cannot delete their own account.'
      });
    }

    const targetUser = await User.findById(userId);
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

    await User.findByIdAndDelete(userId);

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'DELETE USER',
      user: req.user,
      details: `Admin "${adminName}" permanently deleted user account "${targetUser.name}" (${targetUser.email}).`
    });

    return res.status(200).json({
      success: true,
      message: `User account "${targetUser.name}" deleted permanently from the database.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update citizen user details
// @route   PUT /api/admin/users/:userId
// @access  Private / Admin
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided identifier.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const allowedFields = [
      'name', 'email', 'phone', 'role', 'state', 'city', 'age',
      'gender', 'occupation', 'education', 'annualIncome', 'caste',
      'disabilityStatus', 'bplStatus', 'isBlocked', 'status'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'EDIT USER',
      user: req.user,
      details: `Admin "${adminName}" updated profile of User "${user.name}" (${user.email}).`
    });

    return res.status(200).json({
      success: true,
      message: `User "${user.name}" updated successfully.`,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
