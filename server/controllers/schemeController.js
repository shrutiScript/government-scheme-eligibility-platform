import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
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

  const noIncomeLimit = Boolean(
    ec.noIncomeLimit || e.noIncomeLimit || body.noIncomeLimit ||
    ec.maxIncome === null || e.maxIncome === null || body.maxIncome === null ||
    ec.maxAnnualIncome === null || e.maxAnnualIncome === null || body.maxAnnualIncome === null
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

  const rawMaxIncome = ec.maxIncome ?? e.maxIncome ?? ec.maxAnnualIncome ?? e.maxAnnualIncome ?? body.maxIncome ?? body.maxAnnualIncome;
  const maxIncome = noIncomeLimit ? null : (rawMaxIncome !== undefined && rawMaxIncome !== null && rawMaxIncome !== '' ? Number(rawMaxIncome) : null);
  const disabilityRequired = Boolean(ec.disabilityRequired ?? e.disabilityRequired);
  const bplRequired = Boolean(ec.bplRequired ?? e.bplRequired);

  const cleanEligibilityCriteria = {
    noAgeLimit,
    minAge: noAgeLimit ? null : minAge,
    maxAge: noAgeLimit ? null : maxAge,
    noIncomeLimit,
    maxIncome: noIncomeLimit ? null : maxIncome,
    maxAnnualIncome: noIncomeLimit ? null : maxIncome,
    gender: String(genderValue || 'All'),
    minIncome: Number(ec.minIncome || e.minIncome || 0),
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
    noIncomeLimit,
    maxIncome: noIncomeLimit ? null : maxIncome,
    maxAnnualIncome: noIncomeLimit ? null : maxIncome,
    gender: Array.isArray(e.gender) ? e.gender : [genderValue],
    minIncome: Number(ec.minIncome || e.minIncome || 0),
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

// Validate scheme validity dates
const validateSchemeDates = (body) => {
  const launch = body.launchDate ? String(body.launchDate).trim() : '';
  const last = body.lastDate ? String(body.lastDate).trim() : (body.applicationLastDate ? String(body.applicationLastDate).trim() : '');

  if (launch) {
    const launchTime = new Date(launch).getTime();
    if (isNaN(launchTime)) {
      return 'Please enter a valid launch date.';
    }
  }

  if (last) {
    const lastTime = new Date(last).getTime();
    if (isNaN(lastTime)) {
      return 'Please enter a valid last date / deadline.';
    }
  }

  if (launch && last) {
    const launchTime = new Date(launch).getTime();
    const lastTime = new Date(last).getTime();
    if (!isNaN(launchTime) && !isNaN(lastTime) && lastTime < launchTime) {
      return 'Last date cannot be earlier than launch date.';
    }
  }
  return null;
};

// Validate website URL if provided
const validateOfficialUrl = (url) => {
  if (!url || !String(url).trim()) return null;
  const clean = String(url).trim();
  if (!/^https?:\/\/.+/i.test(clean)) {
    return 'Please enter a valid official website URL.';
  }
  try {
    new URL(clean);
    return null;
  } catch {
    return 'Please enter a valid official website URL.';
  }
};

// Validate age eligibility limits
const validateAgeLimits = (body) => {
  const ec = body.eligibilityCriteria || {};
  const e = body.eligibility || {};

  const noAgeLimit = Boolean(ec.noAgeLimit || e.noAgeLimit || body.noAgeLimit);
  if (noAgeLimit) return null;

  const rawMin = ec.minAge ?? e.minAge ?? body.minAge;
  const rawMax = ec.maxAge ?? e.maxAge ?? body.maxAge;

  let minVal = null;
  let maxVal = null;

  if (rawMin !== undefined && rawMin !== null && String(rawMin).trim() !== '') {
    const num = Number(rawMin);
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 120) {
      return 'Minimum age must be a whole number between 0 and 120.';
    }
    minVal = num;
  }

  if (rawMax !== undefined && rawMax !== null && String(rawMax).trim() !== '') {
    const num = Number(rawMax);
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 120) {
      return 'Maximum age must be a whole number between 0 and 120.';
    }
    maxVal = num;
  }

  if (minVal !== null && maxVal !== null && minVal > maxVal) {
    return 'Minimum age cannot be greater than maximum age.';
  }

  return null;
};

// Validate annual income eligibility limits
const validateIncomeLimits = (body) => {
  const ec = body.eligibilityCriteria || {};
  const e = body.eligibility || {};

  const noIncomeLimit = Boolean(ec.noIncomeLimit || e.noIncomeLimit || body.noIncomeLimit);
  if (noIncomeLimit) return null;

  const rawMax = ec.maxIncome ?? e.maxIncome ?? ec.maxAnnualIncome ?? e.maxAnnualIncome ?? body.maxIncome ?? body.maxAnnualIncome;

  if (rawMax !== undefined && rawMax !== null && String(rawMax).trim() !== '') {
    const num = Number(rawMax);
    if (isNaN(num) || num < 0) {
      return 'Please enter a valid annual income limit.';
    }
  }

  return null;
};

// Helper to deduplicate and clean string arrays
const cleanStringArray = (val) => {
  if (Array.isArray(val)) {
    return Array.from(new Set(val.map((s) => String(s || '').trim()).filter(Boolean)));
  }
  if (typeof val === 'string') {
    return Array.from(new Set(val.split('\n').map((s) => s.trim()).filter(Boolean)));
  }
  return [];
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

// @desc    Create a new scheme with strict validation
// @route   POST /api/schemes
// @access  Private / Admin
export const createScheme = async (req, res, next) => {
  try {
    const {
      title,
      code,
      department,
      category,
      sponsorType,
      officialWebsiteUrl,
      shortDescription,
      detailedDescription,
      description,
      benefits,
      requiredDocuments,
      status,
      isActive
    } = req.body;

    // 1. Title validation
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle || cleanTitle.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid scheme title.'
      });
    }

    // Title uniqueness check (case-insensitive)
    const escapedTitle = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingScheme = await Scheme.findOne({
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }
    });
    if (existingScheme) {
      return res.status(400).json({
        success: false,
        message: 'A scheme with this title already exists.'
      });
    }

    // 2. Scheme Code / Acronym validation (optional, but must be unique if entered)
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (cleanCode) {
      const escapedCode = cleanCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingCode = await Scheme.findOne({
        code: { $regex: new RegExp(`^${escapedCode}$`, 'i') }
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'A scheme with this code/acronym already exists.'
        });
      }
    }

    // 3. Nodal Department validation
    const cleanDept = typeof department === 'string' ? department.trim() : '';
    if (!cleanDept || cleanDept.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the nodal department.'
      });
    }

    // 4. Category validation
    const cleanCategory = typeof category === 'string' ? category.trim() : '';
    if (!cleanCategory || cleanCategory === 'All') {
      return res.status(400).json({
        success: false,
        message: 'Please select a scheme category.'
      });
    }

    // 5. Sponsor Type validation
    const cleanSponsor = typeof sponsorType === 'string' ? sponsorType.trim() : '';
    if (!cleanSponsor) {
      return res.status(400).json({
        success: false,
        message: 'Please select the sponsor type.'
      });
    }

    // 6. Official Website URL validation
    const urlError = validateOfficialUrl(officialWebsiteUrl);
    if (urlError) {
      return res.status(400).json({
        success: false,
        message: urlError
      });
    }

    // 7. Dates validation
    const dateError = validateSchemeDates(req.body);
    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError
      });
    }

    // 8. Summary Description validation
    const cleanShortDesc = typeof shortDescription === 'string' ? shortDescription.trim() : '';
    const cleanDetailedDesc = typeof detailedDescription === 'string' ? detailedDescription.trim() : (typeof description === 'string' ? description.trim() : '');

    if (!cleanShortDesc || cleanShortDesc.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a short summary description.'
      });
    }

    // 9. Age Criteria validation
    const ageError = validateAgeLimits(req.body);
    if (ageError) {
      return res.status(400).json({
        success: false,
        message: ageError
      });
    }

    // 10. Income Criteria validation
    const incomeError = validateIncomeLimits(req.body);
    if (incomeError) {
      return res.status(400).json({
        success: false,
        message: incomeError
      });
    }

    // 11. Active / Inactive Status determination
    const schemeStatus = status ? status : (isActive === false ? 'Inactive' : 'Active');
    const isSchemeActive = schemeStatus === 'Active';

    // 12. Clean arrays
    const cleanBenefits = cleanStringArray(benefits);
    const cleanDocs = cleanStringArray(requiredDocuments || req.body.documentsRequired);

    const schemeData = {
      ...req.body,
      title: cleanTitle,
      code: cleanCode,
      department: cleanDept,
      category: cleanCategory,
      sponsorType: cleanSponsor,
      officialWebsiteUrl: typeof officialWebsiteUrl === 'string' ? officialWebsiteUrl.trim() : '',
      shortDescription: cleanShortDesc,
      description: cleanDetailedDesc || cleanShortDesc,
      detailedDescription: cleanDetailedDesc || cleanShortDesc,
      benefits: cleanBenefits,
      requiredDocuments: cleanDocs,
      documentsRequired: cleanDocs,
      status: schemeStatus,
      isActive: isSchemeActive,
      launchDate: req.body.launchDate ? String(req.body.launchDate).trim() : '2019-02-24',
      lastDate: req.body.lastDate || req.body.applicationLastDate || '',
      applicationLastDate: req.body.applicationLastDate || req.body.lastDate || '',
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
      message: 'Scheme published successfully.',
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scheme details with strict validation
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

    const {
      title,
      code,
      department,
      category,
      sponsorType,
      officialWebsiteUrl,
      shortDescription,
      detailedDescription,
      description,
      benefits,
      requiredDocuments
    } = req.body;

    // 1. Title validation & uniqueness
    if (title !== undefined) {
      const cleanTitle = typeof title === 'string' ? title.trim() : '';
      if (!cleanTitle || cleanTitle.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid scheme title.'
        });
      }

      const escapedTitle = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingScheme = await Scheme.findOne({
        title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingScheme) {
        return res.status(400).json({
          success: false,
          message: 'A scheme with this title already exists.'
        });
      }
    }

    // 2. Code uniqueness if entered
    if (code !== undefined) {
      const cleanCode = typeof code === 'string' ? code.trim() : '';
      if (cleanCode) {
        const escapedCode = cleanCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingCode = await Scheme.findOne({
          code: { $regex: new RegExp(`^${escapedCode}$`, 'i') },
          _id: { $ne: id }
        });
        if (existingCode) {
          return res.status(400).json({
            success: false,
            message: 'A scheme with this code/acronym already exists.'
          });
        }
      }
    }

    // 3. Department validation
    if (department !== undefined) {
      const cleanDept = typeof department === 'string' ? department.trim() : '';
      if (!cleanDept || cleanDept.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Please enter the nodal department.'
        });
      }
    }

    // 4. Category validation
    if (category !== undefined) {
      const cleanCategory = typeof category === 'string' ? category.trim() : '';
      if (!cleanCategory || cleanCategory === 'All') {
        return res.status(400).json({
          success: false,
          message: 'Please select a scheme category.'
        });
      }
    }

    // 5. Sponsor validation
    if (sponsorType !== undefined) {
      const cleanSponsor = typeof sponsorType === 'string' ? sponsorType.trim() : '';
      if (!cleanSponsor) {
        return res.status(400).json({
          success: false,
          message: 'Please select the sponsor type.'
        });
      }
    }

    // 6. URL validation
    if (officialWebsiteUrl !== undefined) {
      const urlError = validateOfficialUrl(officialWebsiteUrl);
      if (urlError) {
        return res.status(400).json({
          success: false,
          message: urlError
        });
      }
    }

    // 7. Dates validation
    const dateError = validateSchemeDates(req.body);
    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError
      });
    }

    // 8. Description validation
    if (shortDescription !== undefined || detailedDescription !== undefined || description !== undefined) {
      const cleanShortDesc = typeof shortDescription === 'string' ? shortDescription.trim() : '';
      const cleanDetailedDesc = typeof detailedDescription === 'string' ? detailedDescription.trim() : (typeof description === 'string' ? description.trim() : '');
      const finalDesc = cleanShortDesc || cleanDetailedDesc;

      if ((shortDescription !== undefined || detailedDescription !== undefined) && (!finalDesc || finalDesc.length < 5)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a short summary description.'
        });
      }
    }

    // 9. Age validation
    const ageError = validateAgeLimits(req.body);
    if (ageError) {
      return res.status(400).json({
        success: false,
        message: ageError
      });
    }

    // 10. Income validation
    const incomeError = validateIncomeLimits(req.body);
    if (incomeError) {
      return res.status(400).json({
        success: false,
        message: incomeError
      });
    }

    const updateBody = { ...req.body, ...buildEligibilityShapes(req.body) };

    if (updateBody.title) updateBody.title = updateBody.title.trim();
    if (updateBody.code !== undefined) updateBody.code = updateBody.code.trim();
    if (updateBody.department) updateBody.department = updateBody.department.trim();
    if (updateBody.category) updateBody.category = updateBody.category.trim();
    if (updateBody.sponsorType) updateBody.sponsorType = updateBody.sponsorType.trim();
    if (updateBody.officialWebsiteUrl !== undefined) updateBody.officialWebsiteUrl = updateBody.officialWebsiteUrl.trim();

    if (benefits !== undefined) {
      updateBody.benefits = cleanStringArray(benefits);
    }
    if (requiredDocuments !== undefined || req.body.documentsRequired !== undefined) {
      const cleanDocs = cleanStringArray(requiredDocuments || req.body.documentsRequired);
      updateBody.requiredDocuments = cleanDocs;
      updateBody.documentsRequired = cleanDocs;
    }

    if (updateBody.lastDate !== undefined || updateBody.applicationLastDate !== undefined) {
      const lastVal = updateBody.lastDate || updateBody.applicationLastDate || '';
      updateBody.lastDate = lastVal;
      updateBody.applicationLastDate = lastVal;
    }
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
      message: 'Scheme updated successfully.',
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

    // Clean up references to this deleted scheme from all users' saved lists in MongoDB
    await User.updateMany(
      {},
      { $pull: { savedSchemes: { scheme: id } } }
    );

    const adminName = req.user?.name || req.user?.email || 'Admin';
    await logActivity({
      action: 'DELETE SCHEME',
      user: req.user,
      details: `Admin "${adminName}" permanently deleted scheme "${scheme.title}".`
    });

    return res.status(200).json({
      success: true,
      message: `Scheme "${scheme.title}" deleted permanently from the database.`
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
