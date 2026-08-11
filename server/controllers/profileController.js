import User from '../models/User.js';

// @desc    Get logged in user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user demographic profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const {
      name,
      age,
      gender,
      state,
      occupation,
      education,
      annualIncome,
      caste,
      disabilityStatus,
      bplStatus
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    if (gender !== undefined) user.gender = gender;
    if (state !== undefined) user.state = state.trim();
    if (occupation !== undefined) user.occupation = occupation.trim();
    if (education !== undefined) user.education = education.trim();
    if (annualIncome !== undefined) user.annualIncome = Number(annualIncome);
    if (caste !== undefined) user.caste = caste.trim();
    if (disabilityStatus !== undefined) user.disabilityStatus = Boolean(disabilityStatus);
    if (bplStatus !== undefined) user.bplStatus = Boolean(bplStatus);

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar placeholder
// @route   POST /api/profile/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    const avatarUrl = req.body?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
    const user = await User.findById(req.user._id);
    if (user) {
      user.avatar = avatarUrl;
      await user.save();
    }
    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    next(error);
  }
};
