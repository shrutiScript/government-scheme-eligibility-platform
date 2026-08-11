import Scheme from '../models/Scheme.js';

// @desc    Get all active government schemes with search, category, state filters & pagination
// @route   GET /api/schemes
// @access  Public
export const getSchemes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const { search, category, state, occupation, status } = req.query;

    const query = {};

    // Status filter handling for public and admin API requests
    if (status) {
      if (status === 'all') {
        // Admin requesting all schemes (no status restriction)
      } else if (status.toLowerCase() === 'active') {
        query.status = 'Active';
      } else if (status.toLowerCase() === 'inactive') {
        query.status = 'Inactive';
      } else {
        query.status = status;
      }
    } else {
      query.status = 'Active';
    }

    // Category filter
    if (category && category !== 'All') {
      // Regex search for flexible category matching (e.g., 'Agriculture' matches 'Agriculture & Farmers')
      const catRegex = new RegExp(category.replace(/[^a-zA-Z0-9]/g, '.*'), 'i');
      query.category = catRegex;
    }

    // State filter
    if (state && state !== 'All') {
      query.$or = [
        { state: new RegExp(state, 'i') },
        { state: 'All India' },
        { state: 'Central' }
      ];
    }

    // Occupation filter inside eligibility criteria
    if (occupation && occupation !== 'All') {
      query.$or = [
        { 'eligibilityCriteria.allowedOccupations': 'All' },
        { 'eligibilityCriteria.allowedOccupations': new RegExp(occupation, 'i') }
      ];
    }

    // Search query filter across title, description, department, category
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { shortDescription: regex },
        { department: regex },
        { category: regex }
      ];
    }

    const total = await Scheme.countDocuments(query);
    const schemes = await Scheme.find(query)
      .sort({ createdAt: -1 })
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
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Government Scheme not found'
      });
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
    const { title, description, department, category } = req.body;

    if (!title || !description || !department || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required scheme fields: title, description, department, and category.'
      });
    }

    const scheme = await Scheme.create(req.body);

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
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

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
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

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
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    scheme.status = scheme.status === 'Active' ? 'Inactive' : 'Active';
    await scheme.save();

    return res.status(200).json({
      success: true,
      message: `Scheme status updated to ${scheme.status}`,
      scheme
    });
  } catch (error) {
    next(error);
  }
};
