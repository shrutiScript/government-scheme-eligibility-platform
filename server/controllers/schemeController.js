import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';
import { logActivity } from '../utils/activityLogger.js';

// Ensure the two supported eligibility shapes (`eligibility` and
// `eligibilityCriteria`) are always persisted with clean, correctly-typed rules,
// so the eligibility engine and every read path see the same saved values.
const buildEligibilityShapes = (body) => {
  const ec = body.eligibilityCriteria && typeof body.eligibilityCriteria === 'object' ? body.eligibilityCriteria : {};
  const e = body.eligibility && typeof body.eligibility === 'object' ? body.eligibility : {};

  if (!body.eligibilityCriteria && !body.eligibility) return {};

  const noAgeLimit = Boolean(
    ec.noAgeLimit || e.noAgeLimit || body.noAgeLimit ||
    (ec.minAge === null && ec.maxAge === null) ||
    (e.minAge === null && e.maxAge === null) ||
    ((ec.minAge === 0 || ec.minAge === null || ec.minAge === undefined) && (ec.maxAge === 0 || ec.maxAge === null || ec.maxAge === undefined || ec.maxAge >= 100))
  );

  const genderValue = typeof ec.gender === 'string'
    ? ec.gender
    : Array.isArray(e.gender)
      ? e.gender[0] || 'All'
      : typeof e.gender === 'string'
        ? e.gender
        : 'All';

  const occupationsValue = Array.isArray(ec.allowedOccupations)
    ? ec.allowedOccupations
    : Array.isArray(e.occupations)
      ? e.occupations
      : ['All'];

  const educationsValue = Array.isArray(ec.allowedEducations)
    ? ec.allowedEducations
    : Array.isArray(e.educationLevels)
      ? e.educationLevels
      : ['All'];

  const castesValue = Array.isArray(ec.allowedCastes)
    ? ec.allowedCastes
    : Array.isArray(e.castes)
      ? e.castes
      : ['All'];

  const statesValue = Array.isArray(ec.allowedStates)
    ? ec.allowedStates
    : Array.isArray(e.allowedStates)
      ? e.allowedStates
      : ['All'];

  const minAge = noAgeLimit ? null : (ec.minAge !== undefined && ec.minAge !== null && ec.minAge !== '' ? Number(ec.minAge) : (e.minAge !== undefined && e.minAge !== null && e.minAge !== '' ? Number(e.minAge) : null));
  const maxAge = noAgeLimit ? null : (ec.maxAge !== undefined && ec.maxAge !== null && ec.maxAge !== '' ? Number(ec.maxAge) : (e.maxAge !== undefined && e.maxAge !== null && e.maxAge !== '' ? Number(e.maxAge) : null));
  const maxIncome = ec.maxIncome ?? e.maxIncome ?? 10000000;
  const disabilityRequired = Boolean(ec.disabilityRequired ?? e.disabilityRequired);
  const bplRequired = Boolean(ec.bplRequired ?? e.bplRequired);

  const cleanEligibilityCriteria = {
    noAgeLimit,
    minAge: noAgeLimit ? null : minAge,
    maxAge: noAgeLimit ? null : maxAge,
    gender: String(genderValue || 'All'),
    maxIncome: Number(maxIncome),
    allowedOccupations: occupationsValue,
    allowedEducations: educationsValue,
    allowedCastes: castesValue,
    allowedStates: statesValue,
    disabilityRequired,
    bplRequired
  };

  const cleanEligibility = {
    noAgeLimit,
    minAge: noAgeLimit ? null : minAge,
    maxAge: noAgeLimit ? null : maxAge,
    gender: Array.isArray(e.gender) ? e.gender : [genderValue],
    maxIncome: Number(maxIncome),
    occupations: occupationsValue,
    educationLevels: educationsValue,
    castes: castesValue,
    allowedStates: statesValue,
    disabilityRequired,
    bplRequired
  };

  return {
    eligibilityCriteria: cleanEligibilityCriteria,
    eligibility: cleanEligibility
  };
};

// Validate age eligibility limits.
// If noAgeLimit is true or bounds are empty, age is ignored.
// If bounds exist, they must be integers from 1 to 120 with minAge <= maxAge.
const validateAgeLimits = (body) => {
  const ec = body.eligibilityCriteria || {};
  const e = body.eligibility || {};

  const noAgeLimit = Boolean(ec.noAgeLimit || e.noAgeLimit || body.noAgeLimit);
  if (noAgeLimit) return null;

  const minAge = ec.minAge ?? e.minAge;
  const maxAge = ec.maxAge ?? e.maxAge;

  // Empty or null age values represent no age restriction
  if ((minAge === null || minAge === undefined || minAge === '') &&
    (maxAge === null || maxAge === undefined || maxAge === '')) {
    return null;
  }

  if (minAge !== undefined && minAge !== null && minAge !== '') {
    const num = Number(minAge);
    if (!Number.isInteger(num) || num < 1 || num > 120) {
      return 'Minimum age must be an integer between 1 and 120 (or select No Age Limit).';
    }
  }

  if (maxAge !== undefined && maxAge !== null && maxAge !== '') {
    const num = Number(maxAge);
    if (!Number.isInteger(num) || num < 1 || num > 120) {
      return 'Maximum age must be an integer between 1 and 120 (or select No Age Limit).';
    }
  }

  if (
    minAge !== undefined && minAge !== null && minAge !== '' &&
    maxAge !== undefined && maxAge !== null && maxAge !== ''
  ) {
    if (Number(minAge) > Number(maxAge)) {
      return 'Minimum age cannot be greater than maximum age.';
    }
  }

  return null;
};

// @desc    Get all active government schemes with search, category, state filters & pagination
// @route   GET /api/schemes
// @access  Public
export const getSchemes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      state,
      occupation,
      gender,
      caste,
      status,
      sortBy,
      sortOrder
    } = req.query;

    const andConditions = [];

    // Status filter handling for public and admin API requests
    const isAdmin = req.user && req.user.role === 'admin';

    if (status) {
      const s = status.toLowerCase();
      if (s === 'active') {
        andConditions.push({
          $or: [
            { status: 'Active' },
            { status: 'ACTIVE' },
            { status: 'active' },
            { isActive: true }
          ]
        });
      } else if (s === 'inactive') {
        andConditions.push({
          $or: [
            { status: 'Inactive' },
            { status: 'INACTIVE' },
            { status: 'inactive' },
            { isActive: false }
          ]
        });
      } else if (s === 'all') {
        // Admin requesting all schemes (no status restriction)
      } else {
        andConditions.push({ status });
      }
    } else if (!isAdmin) {
      // Non-admin / Citizen requests without filter MUST strictly see only Active schemes
      andConditions.push({
        $or: [
          { status: 'Active' },
          { status: 'ACTIVE' },
          { status: 'active' },
          { isActive: true }
        ]
      });
    }

    // Category filter
    if (category && category !== 'All' && category.toLowerCase() !== 'all') {
      const catRegex = new RegExp(category.replace(/[^a-zA-Z0-9]/g, '.*'), 'i');
      andConditions.push({ category: catRegex });
    }

    // State filter (All / All India / Central = unrestricted)
    if (
      state &&
      state !== 'All' &&
      state.toLowerCase() !== 'all' &&
      state.toLowerCase() !== 'all india'
    ) {
      const stateRegex = new RegExp(state, 'i');
      andConditions.push({
        $or: [
          { state: stateRegex },
          { state: 'All India' },
          { state: 'Central' },
          { 'eligibilityCriteria.allowedStates': 'All' },
          { 'eligibilityCriteria.allowedStates': 'All India' },
          { 'eligibilityCriteria.allowedStates': 'All States' },
          { 'eligibilityCriteria.allowedStates': stateRegex }
        ]
      });
    }

    // Occupation filter (All / All Occupations = unrestricted)
    if (
      occupation &&
      occupation !== 'All' &&
      occupation.toLowerCase() !== 'all' &&
      occupation.toLowerCase() !== 'all occupations'
    ) {
      const occRegex = new RegExp(occupation, 'i');
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.allowedOccupations': 'All' },
          { 'eligibilityCriteria.allowedOccupations': 'All Occupations' },
          { 'eligibilityCriteria.allowedOccupations': occRegex }
        ]
      });
    }

    // Gender filter (All / All Genders = unrestricted)
    if (
      gender &&
      gender !== 'All' &&
      gender.toLowerCase() !== 'all' &&
      gender.toLowerCase() !== 'all genders'
    ) {
      const genRegex = new RegExp(gender, 'i');
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.gender': 'All' },
          { 'eligibilityCriteria.gender': 'All Genders' },
          { 'eligibilityCriteria.gender': genRegex }
        ]
      });
    }

    // Caste / Social Category filter (All / All Categories = unrestricted)
    if (
      caste &&
      caste !== 'All' &&
      caste.toLowerCase() !== 'all' &&
      caste.toLowerCase() !== 'all categories'
    ) {
      const casteRegex = new RegExp(caste, 'i');
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.allowedCastes': 'All' },
          { 'eligibilityCriteria.allowedCastes': 'All Categories' },
          { 'eligibilityCriteria.allowedCastes': casteRegex }
        ]
      });
    }

    // Search query filter across title, description, shortDescription, department, category, tags, beneficiaries
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      andConditions.push({
        $or: [
          { title: regex },
          { description: regex },
          { shortDescription: regex },
          { department: regex },
          { category: regex },
          { tags: regex },
          { beneficiaries: regex }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Dynamic Sorting
    const sortConfig = {};
    const normalizedSortBy = (sortBy || 'newest').toLowerCase();
    const orderDirection = (sortOrder || '').toLowerCase() === 'asc' ? 1 : -1;

    if (normalizedSortBy === 'name_asc' || normalizedSortBy === 'title_asc' || normalizedSortBy === 'a-z' || (normalizedSortBy === 'title' && orderDirection === 1)) {
      sortConfig.title = 1;
    } else if (normalizedSortBy === 'name_desc' || normalizedSortBy === 'title_desc' || normalizedSortBy === 'z-a' || (normalizedSortBy === 'title' && orderDirection === -1)) {
      sortConfig.title = -1;
    } else if (normalizedSortBy === 'category' || normalizedSortBy === 'category_asc') {
      sortConfig.category = orderDirection === -1 && normalizedSortBy === 'category' ? -1 : 1;
    } else if (normalizedSortBy === 'income_asc' || normalizedSortBy === 'income_low' || (normalizedSortBy === 'maxincome' && orderDirection === 1)) {
      sortConfig['eligibilityCriteria.maxIncome'] = 1;
    } else if (normalizedSortBy === 'income_desc' || normalizedSortBy === 'income_high' || (normalizedSortBy === 'maxincome' && orderDirection === -1)) {
      sortConfig['eligibilityCriteria.maxIncome'] = -1;
    } else if (normalizedSortBy === 'popular' || normalizedSortBy === 'views') {
      sortConfig.viewCount = -1;
    } else if (normalizedSortBy === 'oldest' || normalizedSortBy === 'created_asc' || (normalizedSortBy === 'createdat' && orderDirection === 1)) {
      sortConfig.createdAt = 1;
    } else {
      // Default: Newest first
      sortConfig.createdAt = -1;
    }

    const total = await Scheme.countDocuments(query);
    const schemes = await Scheme.find(query)
      .collation({ locale: 'en', strength: 2 })
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: schemes.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      schemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scheme details by ID & increment view count
// @route   GET /api/schemes/:id
// @access  Public
export const getSchemeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // If 'all' or 'All' is requested, delegate to getSchemes
    if (!id || id.toLowerCase() === 'all') {
      return getSchemes(req, res, next);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found with the provided identifier.'
      });
    }

    const scheme = await Scheme.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found'
      });
    }

    // Hide Inactive schemes from regular users/guests
    if (scheme.status === 'Inactive') {
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Government Scheme not found or unavailable'
        });
      }
    }

    return res.status(200).json({
      success: true,
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private / Admin
export const createScheme = async (req, res, next) => {
  try {
    const { title, description, detailedDescription, department, category, status, isActive } = req.body;

    const finalDescription = description || detailedDescription;
    if (!title || !finalDescription || !department || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required scheme fields: title, description, department, and category.'
      });
    }

    const ageError = validateAgeLimits(req.body);
    if (ageError) {
      return res.status(400).json({
        success: false,
        message: ageError
      });
    }

    const schemeStatus = status ? status : (isActive === false ? 'Inactive' : 'Active');
    const isSchemeActive = schemeStatus === 'Active';

    const schemeData = {
      ...req.body,
      description: finalDescription,
      detailedDescription: detailedDescription || finalDescription,
      status: schemeStatus,
      isActive: isSchemeActive,
      ...buildEligibilityShapes(req.body)
    };

    const scheme = await Scheme.create(schemeData);

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'ADD SCHEME',
      user: req.user,
      details: `Admin "${adminName}" created scheme "${scheme.title}" (${scheme.category}).`
    });

    return res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scheme details
// @route   PUT /api/schemes/:id
// @access  Private / Admin
export const updateScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found with the provided identifier.'
      });
    }

    const ageError = validateAgeLimits(req.body);
    if (ageError) {
      return res.status(400).json({
        success: false,
        message: ageError
      });
    }

    const updateBody = { ...req.body, ...buildEligibilityShapes(req.body) };
    if (updateBody.status) {
      updateBody.isActive = updateBody.status === 'Active';
    } else if (updateBody.isActive !== undefined) {
      updateBody.status = updateBody.isActive ? 'Active' : 'Inactive';
    }
    if (!updateBody.description && updateBody.detailedDescription) {
      updateBody.description = updateBody.detailedDescription;
    }
    if (!updateBody.shortDescription && updateBody.description) {
      updateBody.shortDescription = updateBody.description.slice(0, 200);
    }

    const scheme = await Scheme.findByIdAndUpdate(id, { $set: updateBody }, {
      new: true,
      runValidators: true
    });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'EDIT SCHEME',
      user: req.user,
      details: `Admin "${adminName}" updated scheme "${scheme.title}".`
    });

    return res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scheme
// @route   DELETE /api/schemes/:id
// @access  Private / Admin
export const deleteScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found with the provided identifier.'
      });
    }

    const scheme = await Scheme.findByIdAndDelete(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'DELETE SCHEME',
      user: req.user,
      details: `Admin "${adminName}" deleted scheme "${scheme.title}".`
    });

    return res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle scheme active/inactive status
// @route   PATCH /api/schemes/:id/toggle-status
// @access  Private / Admin
export const toggleSchemeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found with the provided identifier.'
      });
    }

    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    const previousStatus = scheme.status || (scheme.isActive ? 'Active' : 'Inactive');
    const newStatus = previousStatus === 'Active' ? 'Inactive' : 'Active';

    scheme.status = newStatus;
    scheme.isActive = newStatus === 'Active';
    await scheme.save();

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: newStatus === 'Active' ? 'ACTIVATE SCHEME' : 'DEACTIVATE SCHEME',
      user: req.user,
      details: `Admin "${adminName}" changed scheme "${scheme.title}" status from ${previousStatus} to ${newStatus}.`
    });

    return res.status(200).json({
      success: true,
      message: `Scheme status updated to ${newStatus}`,
      scheme
    });
  } catch (error) {
    next(error);
  }
};
