import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken, JWT_SECRET } from '../middleware/authMiddleware.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation of required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.'
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email address.'
      });
    }

    // 3. Create user (password hashing is handled via User model pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role === 'admin' ? 'admin' : 'user'
    });

    // 4. Record registration activity (no sensitive data stored)
    await logActivity({
      action: 'User Registration',
      user,
      details: `New ${user.role} account "${user.name}" registered with email ${user.email}.`
    });

    // 5. Generate JWT Token
    const token = generateToken(user._id);

    // 6. Return HTTP 201 response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Blocked accounts must never be granted an authenticated session.
    if (user.isBlocked || user.status === 'blocked' || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the administrator.'
      });
    }

    const token = generateToken(user._id);

    await logActivity({
      action: 'User Login',
      user,
      details: `User "${user.name}" (${user.email}) signed in successfully.`
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout current user (best-effort, does not require valid session)
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          await logActivity({
            action: 'User Logout',
            user,
            details: `User "${user.name}" (${user.email}) signed out.`
          });
        }
      } catch (err) {
        // Invalid/expired token — nothing to log, logout still succeeds.
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.state !== undefined) user.state = req.body.state;
    if (req.body.city !== undefined) user.city = req.body.city;
    if (req.body.age !== undefined) user.age = req.body.age;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.occupation !== undefined) user.occupation = req.body.occupation;
    if (req.body.education !== undefined) user.education = req.body.education;
    if (req.body.annualIncome !== undefined) user.annualIncome = req.body.annualIncome;
    if (req.body.caste !== undefined) user.caste = req.body.caste;
    if (req.body.disabilityStatus !== undefined) user.disabilityStatus = req.body.disabilityStatus;
    if (req.body.bplStatus !== undefined) user.bplStatus = req.body.bplStatus;

    await user.save();

    await logActivity({
      action: user.role === 'admin' ? 'UPDATE ADMIN PROFILE' : 'EDIT PROFILE',
      user,
      details: `${user.role === 'admin' ? 'Administrator' : 'User'} "${user.name}" updated their profile information.`
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user account email
// @route   PUT /api/auth/email
// @access  Private
export const updateEmail = async (req, res, next) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current password and new email address.'
      });
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address format.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password verification failed. Please enter your correct password.'
      });
    }

    if (user.email === cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email address cannot be the same as your current email.'
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already in use by another account.'
      });
    }

    const oldEmail = user.email;
    user.email = cleanEmail;
    await user.save();

    const token = generateToken(user._id);

    await logActivity({
      action: user.role === 'admin' ? 'UPDATE ADMIN EMAIL' : 'UPDATE EMAIL',
      user,
      details: `${user.role === 'admin' ? 'Administrator' : 'User'} "${user.name}" changed email from "${oldEmail}" to "${cleanEmail}".`
    });

    return res.status(200).json({
      success: true,
      message: 'Email address updated successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password verification failed. Please enter your correct password.'
      });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      action: user.role === 'admin' ? 'UPDATE ADMIN PASSWORD' : 'UPDATE PASSWORD',
      user,
      details: `${user.role === 'admin' ? 'Administrator' : 'User'} "${user.name}" updated their account password.`
    });

    return res.status(200).json({
      success: true,
      message: 'Account password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    if (user.isBlocked || user.status === 'blocked' || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the administrator.'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
