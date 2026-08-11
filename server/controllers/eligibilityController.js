import Scheme from '../models/Scheme.js';

// Helper function to evaluate scheme eligibility for a given profile
const evaluateSchemeEligibility = (scheme, profile) => {
  const criteria = scheme.eligibilityCriteria || {};
  const reasonsNotEligible = [];
  let score = 100;

  // 1. Age Check
  if (profile.age !== undefined && profile.age !== null) {
    const age = Number(profile.age);
    if (criteria.minAge && age < criteria.minAge) {
      reasonsNotEligible.push(`Minimum required age is ${criteria.minAge} (Your age: ${age})`);
      score -= 25;
    }
    if (criteria.maxAge && age > criteria.maxAge) {
      reasonsNotEligible.push(`Maximum allowed age is ${criteria.maxAge} (Your age: ${age})`);
      score -= 25;
    }
  }

  // 2. Gender Check
  if (profile.gender && criteria.gender && criteria.gender !== 'All') {
    if (profile.gender.toLowerCase() !== criteria.gender.toLowerCase()) {
      reasonsNotEligible.push(`Scheme is specifically for ${criteria.gender} applicants`);
      score -= 30;
    }
  }

  // 3. Income Check
  if (profile.annualIncome !== undefined && profile.annualIncome !== null) {
    const income = Number(profile.annualIncome);
    if (criteria.maxIncome && income > criteria.maxIncome) {
      reasonsNotEligible.push(`Annual income ceiling is ₹${criteria.maxIncome.toLocaleString('en-IN')} (Your income: ₹${income.toLocaleString('en-IN')})`);
      score -= 30;
    }
    if (criteria.minIncome && income < criteria.minIncome) {
      reasonsNotEligible.push(`Minimum annual income requirement is ₹${criteria.minIncome.toLocaleString('en-IN')}`);
      score -= 20;
    }
  }

  // 4. State Check
  if (profile.state && criteria.allowedStates && Array.isArray(criteria.allowedStates)) {
    const hasAllState = criteria.allowedStates.some(s => s.toLowerCase() === 'all' || s.toLowerCase() === 'all india');
    if (!hasAllState) {
      const matchState = criteria.allowedStates.some(s => s.toLowerCase() === profile.state.toLowerCase());
      if (!matchState) {
        reasonsNotEligible.push(`Available in: ${criteria.allowedStates.join(', ')} (Your state: ${profile.state})`);
        score -= 25;
      }
    }
  }

  // 5. Occupation Check
  if (profile.occupation && criteria.allowedOccupations && Array.isArray(criteria.allowedOccupations)) {
    const hasAllOcc = criteria.allowedOccupations.some(o => o.toLowerCase() === 'all');
    if (!hasAllOcc) {
      const matchOcc = criteria.allowedOccupations.some(o => o.toLowerCase().includes(profile.occupation.toLowerCase()) || profile.occupation.toLowerCase().includes(o.toLowerCase()));
      if (!matchOcc) {
        reasonsNotEligible.push(`Eligible occupations: ${criteria.allowedOccupations.join(', ')} (Your occupation: ${profile.occupation})`);
        score -= 20;
      }
    }
  }

  // 6. Disability Check
  if (criteria.disabilityRequired && !profile.disabilityStatus) {
    reasonsNotEligible.push('Disability certificate / PwD status required');
    score -= 30;
  }

  // 7. BPL Check
  if (criteria.bplRequired && !profile.bplStatus) {
    reasonsNotEligible.push('Below Poverty Line (BPL) card / status required');
    score -= 30;
  }

  const isEligible = reasonsNotEligible.length === 0;
  const matchPercentage = isEligible ? 100 : Math.max(20, Math.min(95, score));

  return {
    scheme,
    isEligible,
    matchPercentage,
    reasonsNotEligible
  };
};

// @desc    Check scheme eligibility against user profile
// @route   POST /api/eligibility/check
// @access  Public / Private
export const checkEligibility = async (req, res, next) => {
  try {
    const profile = req.body || {};
    const schemes = await Scheme.find({ status: 'Active' });

    const eligibleSchemes = [];
    const notEligibleSchemes = [];

    schemes.forEach((scheme) => {
      const result = evaluateSchemeEligibility(scheme, profile);
      if (result.isEligible) {
        eligibleSchemes.push(result);
      } else {
        notEligibleSchemes.push(result);
      }
    });

    return res.status(200).json({
      success: true,
      totalChecked: schemes.length,
      eligibleSchemes,
      notEligibleSchemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard recommendations (Recommended, Popular, Recently Added)
// @route   GET /api/eligibility/recommendations
// @access  Public / Private
export const getRecommendations = async (req, res, next) => {
  try {
    const activeSchemes = await Scheme.find({ status: 'Active' }).sort({ createdAt: -1 });

    const popular = [...activeSchemes].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    const recentlyAdded = activeSchemes.slice(0, 6);
    const recommended = activeSchemes.slice(0, 6);

    return res.status(200).json({
      success: true,
      recommended,
      popular: popular.slice(0, 6),
      recentlyAdded
    });
  } catch (error) {
    next(error);
  }
};
