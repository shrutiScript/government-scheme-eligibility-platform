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

    const validationErrors = {};

    // 1. Full Name Validation
    let cleanName = user.name || '';
    if (name !== undefined) {
      cleanName = typeof name === 'string' ? name.trim() : '';
      if (!cleanName) {
        validationErrors.name = 'Please enter your full name.';
      } else if (cleanName.length < 2 || !/^[a-zA-Z\s]+$/.test(cleanName)) {
        validationErrors.name = 'Please enter a valid full name.';
      }
    } else if (!cleanName) {
      validationErrors.name = 'Please enter your full name.';
    }

    // 2. Mobile Number Validation
    let cleanMobile = user.mobileNumber || user.phone || '';
    if (mobileNumber !== undefined) {
      cleanMobile = typeof mobileNumber === 'string' ? mobileNumber.trim() : (mobileNumber !== null ? String(mobileNumber).trim() : '');
      if (!cleanMobile) {
        validationErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      } else if (!/^[6-9]\d{9}$/.test(cleanMobile) && !/^\d{10}$/.test(cleanMobile)) {
        validationErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      }
    } else if (!cleanMobile && !isFirstSave) {
      validationErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    // 3. Age (Years) Validation
    let finalAge = user.age;
    if (age !== undefined) {
      if (age === null || age === '') {
        validationErrors.age = 'Age must be between 1 and 120 years.';
      } else {
        const parsedAge = Number(age);
        if (isNaN(parsedAge) || !Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
          validationErrors.age = 'Age must be between 1 and 120 years.';
        } else {
          finalAge = parsedAge;
        }
      }
    } else if (finalAge === undefined || finalAge === null) {
      if (!isFirstSave) validationErrors.age = 'Age must be between 1 and 120 years.';
    }

    // 4. Gender Validation
    const validGenders = ['Male', 'Female', 'Transgender', 'Other'];
    let cleanGender = user.gender || '';
    if (gender !== undefined) {
      cleanGender = typeof gender === 'string' ? gender.trim() : '';
      if (!cleanGender || !validGenders.includes(cleanGender)) {
        validationErrors.gender = 'Please select your gender.';
      }
    } else if (!cleanGender && !isFirstSave) {
      validationErrors.gender = 'Please select your gender.';
    }

    // 5. Annual Income Validation
    let finalIncome = user.annualIncome;
    if (annualIncome !== undefined) {
      if (annualIncome === null || annualIncome === '') {
        validationErrors.annualIncome = 'Please enter a valid annual income.';
      } else {
        const parsedIncome = Number(annualIncome);
        if (isNaN(parsedIncome) || parsedIncome < 0) {
          validationErrors.annualIncome = 'Please enter a valid annual income.';
        } else {
          finalIncome = parsedIncome;
        }
      }
    } else if (finalIncome === undefined || finalIncome === null) {
      if (!isFirstSave) validationErrors.annualIncome = 'Please enter a valid annual income.';
    }

    // 6. State of Residence Validation
    let cleanState = user.state || '';
    if (state !== undefined) {
      cleanState = typeof state === 'string' ? state.trim() : '';
      if (!cleanState || cleanState.toLowerCase() === 'all' || cleanState === 'Select State') {
        validationErrors.state = 'Please select your state.';
      }
    } else if (!cleanState && !isFirstSave) {
      validationErrors.state = 'Please select your state.';
    }

    // 7. City Validation
    let cleanCity = user.city || '';
    if (city !== undefined) {
      cleanCity = typeof city === 'string' ? city.trim() : '';
      if (!cleanCity || cleanCity === 'Select City' || cleanCity === 'Select State first') {
        validationErrors.city = 'Please select your city.';
      }
    } else if (!cleanCity && !isFirstSave) {
      validationErrors.city = 'Please select your city.';
    }

    // 8. Occupation Validation
    let cleanOccupation = user.occupation || '';
    if (occupation !== undefined) {
      cleanOccupation = typeof occupation === 'string' ? occupation.trim() : '';
      if (!cleanOccupation || cleanOccupation.toLowerCase() === 'all' || cleanOccupation === 'Select Occupation') {
        validationErrors.occupation = 'Please select your occupation.';
      }
    } else if (!cleanOccupation && !isFirstSave) {
      validationErrors.occupation = 'Please select your occupation.';
    }

    // 9. Education Level Validation
    let cleanEducation = user.education || '';
    if (education !== undefined) {
      cleanEducation = typeof education === 'string' ? education.trim() : '';
      if (!cleanEducation || cleanEducation.toLowerCase() === 'all' || cleanEducation === 'Select Education Level') {
        validationErrors.education = 'Please select your education level.';
      }
    } else if (!cleanEducation && !isFirstSave) {
      validationErrors.education = 'Please select your education level.';
    }

    // 10. Social Category / Caste Validation
    let cleanCaste = user.caste || '';
    if (caste !== undefined) {
      cleanCaste = typeof caste === 'string' ? caste.trim() : '';
      if (!cleanCaste || cleanCaste.toLowerCase() === 'all' || cleanCaste === 'Select Social Category') {
        validationErrors.caste = 'Please select your social category.';
      }
    } else if (!cleanCaste && !isFirstSave) {
      validationErrors.caste = 'Please select your social category.';
    }

    // If any validation errors exist, return 400 Bad Request with all error details
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMessage = Object.values(validationErrors)[0];
      return res.status(400).json({
        success: false,
        message: firstErrorMessage,
        errors: validationErrors
      });
    }

    // Apply validated, sanitized and formatted values
    user.name = cleanName;
    user.mobileNumber = cleanMobile;
    user.phone = cleanMobile; // Sync phone alias if used elsewhere
    user.age = finalAge;
    user.gender = cleanGender;
    user.annualIncome = finalIncome;
    user.state = cleanState;
    user.city = cleanCity;
    user.occupation = cleanOccupation;
    user.education = cleanEducation;
    user.caste = cleanCaste;
    if (disabilityStatus !== undefined) user.disabilityStatus = Boolean(disabilityStatus);
    if (bplStatus !== undefined) user.bplStatus = Boolean(bplStatus);

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
    const validSavedSchemes = (user.savedSchemes || []).filter(
      (item) => item && item.scheme !== null && item.scheme !== undefined
    );

    // If any deleted schemes were detected, permanently prune them from the user's document in MongoDB
    if (user.savedSchemes && validSavedSchemes.length !== user.savedSchemes.length) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            savedSchemes: validSavedSchemes.map((item) => ({
              scheme: item.scheme._id || item.scheme,
              savedAt: item.savedAt || new Date()
            }))
          }
        }
      );
    }

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

    // Check if already saved (supporting ObjectId, string, or object)
    const alreadySaved = user.savedSchemes.some((item) => {
      if (!item || !item.scheme) return false;
      const currentId = item.scheme._id ? item.scheme._id.toString() : item.scheme.toString();
      return currentId === schemeId.toString();
    });

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
      isSaved: true,
      savedSchemes: user.savedSchemes,
      user: user.toJSON()
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

    // Permanently filter out the scheme by comparing string IDs
    user.savedSchemes = user.savedSchemes.filter((item) => {
      if (!item || !item.scheme) return false;
      const currentId = item.scheme._id ? item.scheme._id.toString() : item.scheme.toString();
      return currentId !== schemeId.toString();
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Scheme removed from saved list',
      isSaved: false,
      savedSchemes: user.savedSchemes,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
