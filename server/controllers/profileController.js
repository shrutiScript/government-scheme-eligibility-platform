import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import { logActivity } from '../utils/activityLogger.js';

const hasProfileData = (user) => {
  return Boolean(
    (user.age !== undefined && user.age !== null) ||
    user.gender ||
    user.state ||
    user.city ||
    user.occupation ||
    user.education ||
    (user.annualIncome !== undefined && user.annualIncome !== null) ||
    user.caste ||
    user.mobileNumber
  );
};

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

    const isFirstSave = !hasProfileData(user);

    const {
      name,
      mobileNumber,
      age,
      gender,
      state,
      city,
      occupation,
      education,
      annualIncome,
      caste,
      disabilityStatus,
      bplStatus
    } = req.body;

    if (name !== undefined && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (mobileNumber !== undefined) {
      user.mobileNumber = typeof mobileNumber === 'string' ? mobileNumber.trim() : '';
    }
    
    if (age !== undefined && age !== '' && age !== null) {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || !Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        return res.status(400).json({
          success: false,
          message: 'Age must be a valid whole number between 1 and 120 years (cannot be 0 or negative).'
        });
      }
      user.age = parsedAge;
    }

    if (gender !== undefined) {
      user.gender = gender || '';
    }
    if (state !== undefined) {
      user.state = typeof state === 'string' ? state.trim() : '';
    }
    if (city !== undefined) {
      user.city = typeof city === 'string' ? city.trim() : '';
    }
    if (occupation !== undefined) {
      user.occupation = typeof occupation === 'string' ? occupation.trim() : '';
    }
    if (education !== undefined) {
      user.education = typeof education === 'string' ? education.trim() : '';
    }

    if (annualIncome !== undefined && annualIncome !== '' && annualIncome !== null) {
      const parsedIncome = Number(annualIncome);
      if (isNaN(parsedIncome) || parsedIncome < 0) {
        return res.status(400).json({
          success: false,
          message: 'Annual income cannot be a negative number.'
        });
      }
      user.annualIncome = parsedIncome;
    }

    if (caste !== undefined) {
      user.caste = typeof caste === 'string' ? caste.trim() : '';
    }
    if (disabilityStatus !== undefined) {
      user.disabilityStatus = Boolean(disabilityStatus);
    }
    if (bplStatus !== undefined) {
      user.bplStatus = Boolean(bplStatus);
    }

    const updatedUser = await user.save();

    await logActivity({
      action: isFirstSave ? 'Profile Created' : 'Profile Updated',
      user: updatedUser,
      details: `${updatedUser.name} (${updatedUser.email}) ${isFirstSave ? 'created their demographic profile' : 'updated their demographic profile'}.`
    });

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
      avatar: avatarUrl,
      user: user ? user.toJSON() : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user profile avatar
// @route   DELETE /api/profile/avatar
// @access  Private
export const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.avatar = '';
    await user.save();

    await logActivity({
      action: 'Profile Avatar Removed',
      user,
      details: `${user.name} (${user.email}) removed their profile photo.`
    });

    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved schemes for currently authenticated user
// @route   GET /api/profile/saved-schemes
// @access  Private
export const getSavedSchemes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedSchemes.scheme',
      select: 'title code department category shortDescription detailedDescription benefits requiredDocuments targetStates officialWebsiteUrl status isActive'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Filter out entries where the scheme might have been deleted from DB
    const validSavedSchemes = (user.savedSchemes || []).filter((item) => item.scheme !== null && item.scheme !== undefined);

    // Return in reverse chronological order (newest saved first)
    validSavedSchemes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    return res.status(200).json({
      success: true,
      count: validSavedSchemes.length,
      savedSchemes: validSavedSchemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Bookmark a scheme for currently authenticated user
// @route   POST /api/profile/saved-schemes/:schemeId
// @access  Private
export const saveScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const scheme = await Scheme.findById(schemeId);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.savedSchemes) {
      user.savedSchemes = [];
    }

    // Check if already saved
    const alreadySaved = user.savedSchemes.some(
      (item) => item.scheme && item.scheme.toString() === schemeId
    );

    if (!alreadySaved) {
      user.savedSchemes.push({
        scheme: scheme._id,
        savedAt: new Date()
      });
      await user.save();

      await logActivity({
        action: 'Scheme Saved',
        user,
        details: `${user.name} bookmarked scheme "${scheme.title}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scheme saved successfully',
      isSaved: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a saved scheme for currently authenticated user
// @route   DELETE /api/profile/saved-schemes/:schemeId
// @access  Private
export const removeSavedScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.savedSchemes) {
      user.savedSchemes = [];
    }

    user.savedSchemes = user.savedSchemes.filter(
      (item) => item.scheme && item.scheme.toString() !== schemeId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Scheme removed from saved list',
      isSaved: false
    });
  } catch (error) {
    next(error);
  }
};
