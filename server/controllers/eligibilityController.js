import Scheme from '../models/Scheme.js';
import User from '../models/User.js';

/**
 * Check if a criteria field represents "All" / "No Restriction"
 */
const isUnrestricted = (val) => {
  if (!val) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === '' || s === 'all' || s === 'all india' || s === 'all states' || s === 'all genders' || s === 'all categories' || s === 'all occupations' || s === 'all education' || s === 'any' || s === 'no restriction' || s === 'central';
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return true;
    return val.some((item) => isUnrestricted(item));
  }
  return false;
};

/**
 * Check if user profile has sufficient demographic data
 */
export const hasDemographicProfile = (profile) => {
  if (!profile || typeof profile !== 'object') return false;
  return Boolean(
    (profile.age !== undefined && profile.age !== null && profile.age !== '') ||
    (profile.annualIncome !== undefined && profile.annualIncome !== null && profile.annualIncome !== '') ||
    profile.gender ||
    profile.state ||
    profile.occupation ||
    profile.education ||
    profile.caste ||
    profile.disabilityStatus ||
    profile.bplStatus
  );
};

/**
 * Helper function to evaluate scheme eligibility for a given profile
 */
export const evaluateSchemeEligibility = (scheme, profile = {}) => {
  // Merge both supported eligibility shapes
  const ec = scheme.eligibilityCriteria || {};
  const e = scheme.eligibility || {};
  const criteria = {
    ...ec,
    ...e
  };

  const reasonsNotEligible = [];
  const qualifyingFactors = [];
  let score = 100;

  // 1. Age Check (Ignore age completely if "No Age Limit")
  const minAge = criteria.minAge !== undefined && criteria.minAge !== null ? Number(criteria.minAge) : 0;
  const maxAge = criteria.maxAge !== undefined && criteria.maxAge !== null ? Number(criteria.maxAge) : 120;
  const isNoAgeLimit = (minAge <= 0 && maxAge >= 100) || criteria.noAgeLimit === true || criteria.ageLimit === 'No Age Limit';

  if (!isNoAgeLimit && (minAge > 0 || maxAge < 100)) {
    if (profile.age !== undefined && profile.age !== null && profile.age !== '') {
      const userAge = Number(profile.age);
      if (!isNaN(userAge)) {
        if (minAge > 0 && userAge < minAge) {
          reasonsNotEligible.push(`Minimum required age is ${minAge} years (Your age: ${userAge})`);
          score -= 25;
        }
        if (maxAge > 0 && maxAge < 100 && userAge > maxAge) {
          reasonsNotEligible.push(`Maximum allowed age is ${maxAge} years (Your age: ${userAge})`);
          score -= 25;
        }
        if ((minAge <= 0 || userAge >= minAge) && (maxAge >= 100 || userAge <= maxAge)) {
          qualifyingFactors.push(`Age (${userAge} yrs) satisfies age requirements (${minAge > 0 ? minAge : 0}–${maxAge < 100 ? maxAge : 'No Limit'})`);
        }
      }
    }
  } else {
    qualifyingFactors.push('No age restriction on this scheme');
  }

  // 2. Gender Check
  const genderRule = criteria.gender;
  if (!isUnrestricted(genderRule)) {
    if (profile.gender && profile.gender.trim()) {
      const allowedGenders = Array.isArray(genderRule) ? genderRule : [genderRule];
      const matchGender = allowedGenders.some(
        (g) => String(g).trim().toLowerCase() === String(profile.gender).trim().toLowerCase()
      );
      if (!matchGender) {
        reasonsNotEligible.push(`Scheme is designated specifically for ${allowedGenders.join('/')} applicants`);
        score -= 30;
      } else {
        qualifyingFactors.push(`Matches eligible gender (${profile.gender})`);
      }
    }
  }

  // 3. Annual Income Check
  const maxIncome = criteria.maxIncome !== undefined && criteria.maxIncome !== null ? Number(criteria.maxIncome) : 10000000;
  const minIncome = criteria.minIncome !== undefined && criteria.minIncome !== null ? Number(criteria.minIncome) : 0;

  if (profile.annualIncome !== undefined && profile.annualIncome !== null && profile.annualIncome !== '') {
    const userIncome = Number(profile.annualIncome);
    if (!isNaN(userIncome)) {
      if (maxIncome > 0 && maxIncome < 10000000 && userIncome > maxIncome) {
        reasonsNotEligible.push(`Annual income ceiling is ₹${maxIncome.toLocaleString('en-IN')} (Your income: ₹${userIncome.toLocaleString('en-IN')})`);
        score -= 30;
      } else if (maxIncome > 0 && maxIncome < 10000000) {
        qualifyingFactors.push(`Income (₹${userIncome.toLocaleString('en-IN')}) is within limit of ₹${maxIncome.toLocaleString('en-IN')}`);
      }

      if (minIncome > 0 && userIncome < minIncome) {
        reasonsNotEligible.push(`Minimum annual income requirement is ₹${minIncome.toLocaleString('en-IN')}`);
        score -= 20;
      }
    }
  }

  // 4. State & City Check
  const stateRule = criteria.allowedStates || (scheme.state ? [scheme.state] : ['All']);
  if (!isUnrestricted(stateRule)) {
    if (profile.state && profile.state.trim()) {
      const statesArray = Array.isArray(stateRule) ? stateRule : [stateRule];
      const matchState = statesArray.some(
        (s) => isUnrestricted(s) || String(s).trim().toLowerCase() === String(profile.state).trim().toLowerCase()
      );
      if (!matchState) {
        reasonsNotEligible.push(`Applicable in: ${statesArray.join(', ')} (Your state: ${profile.state})`);
        score -= 25;
      } else {
        qualifyingFactors.push(`Applicable in your state (${profile.state})`);
      }
    }
  }

  // 5. Occupation Check
  const occRule = criteria.allowedOccupations || criteria.occupations;
  if (!isUnrestricted(occRule)) {
    if (profile.occupation && profile.occupation.trim()) {
      const occList = Array.isArray(occRule) ? occRule : [occRule];
      const pOcc = String(profile.occupation).trim().toLowerCase();
      const matchOcc = occList.some((o) => {
        if (isUnrestricted(o)) return true;
        const oLower = String(o).trim().toLowerCase();
        return oLower === pOcc || oLower.includes(pOcc) || pOcc.includes(oLower);
      });
      if (!matchOcc) {
        reasonsNotEligible.push(`Eligible occupations: ${occList.join(', ')} (Your occupation: ${profile.occupation})`);
        score -= 20;
      } else {
        qualifyingFactors.push(`Matches occupation criteria (${profile.occupation})`);
      }
    }
  }

  // 6. Caste / Social Category Check
  const casteRule = criteria.allowedCastes || criteria.castes || criteria.allowedCategories;
  if (!isUnrestricted(casteRule)) {
    if (profile.caste && profile.caste.trim()) {
      const casteList = Array.isArray(casteRule) ? casteRule : [casteRule];
      const pCaste = String(profile.caste).trim().toLowerCase();
      const matchCaste = casteList.some((c) => {
        if (isUnrestricted(c)) return true;
        const cLower = String(c).trim().toLowerCase();
        return cLower === pCaste || cLower.includes(pCaste) || pCaste.includes(cLower);
      });
      if (!matchCaste) {
        reasonsNotEligible.push(`Eligible social categories: ${casteList.join(', ')} (Your category: ${profile.caste})`);
        score -= 20;
      } else {
        qualifyingFactors.push(`Matches social category (${profile.caste})`);
      }
    }
  }

  // 7. Education Check
  const eduRule = criteria.allowedEducations || criteria.educationLevels;
  if (!isUnrestricted(eduRule)) {
    if (profile.education && profile.education.trim()) {
      const eduList = Array.isArray(eduRule) ? eduRule : [eduRule];
      const pEdu = String(profile.education).trim().toLowerCase();
      const matchEdu = eduList.some((e) => {
        if (isUnrestricted(e)) return true;
        const eLower = String(e).trim().toLowerCase();
        return eLower === pEdu || eLower.includes(pEdu) || pEdu.includes(eLower);
      });
      if (!matchEdu) {
        reasonsNotEligible.push(`Eligible education levels: ${eduList.join(', ')} (Your education: ${profile.education})`);
        score -= 20;
      } else {
        qualifyingFactors.push(`Matches education profile (${profile.education})`);
      }
    }
  }

  // 8. Disability Status Check
  if (criteria.disabilityRequired === true) {
    if (!profile.disabilityStatus) {
      reasonsNotEligible.push('Disability certificate / PwD status required');
      score -= 30;
    } else {
      qualifyingFactors.push('Satisfies PwD beneficiary requirement');
    }
  }

  // 9. BPL Status Check
  if (criteria.bplRequired === true) {
    if (!profile.bplStatus) {
      reasonsNotEligible.push('Below Poverty Line (BPL) card / status required');
      score -= 30;
    } else {
      qualifyingFactors.push('Satisfies BPL cardholder entitlement');
    }
  }

  const isEligible = reasonsNotEligible.length === 0;
  const matchPercentage = isEligible ? 100 : Math.max(20, Math.min(95, score));

  return {
    scheme,
    isEligible,
    matchPercentage,
    reasonsNotEligible,
    qualifyingFactors
  };
};

// @desc    Check scheme eligibility against user profile
// @route   POST /api/eligibility/check
// @access  Public / Private
export const checkEligibility = async (req, res, next) => {
  try {
    let profile = req.body || {};

    // If user is authenticated and body is empty or partial, supplement with DB profile
    if (req.user) {
      const user = await User.findById(req.user._id || req.user.id);
      if (user) {
        profile = {
          name: user.name,
          age: user.age,
          gender: user.gender,
          state: user.state,
          city: user.city,
          occupation: user.occupation,
          education: user.education,
          annualIncome: user.annualIncome,
          caste: user.caste,
          disabilityStatus: user.disabilityStatus,
          bplStatus: user.bplStatus,
          ...profile
        };
      }
    }

    // Only ACTIVE schemes are evaluated
    const schemes = await Scheme.find({
      $and: [
        { status: { $in: ['Active', 'ACTIVE', 'active'] } },
        { isActive: { $ne: false } }
      ]
    });

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

    // Sort eligible schemes by highest match percentage then creation date
    eligibleSchemes.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return new Date(b.scheme.createdAt || 0) - new Date(a.scheme.createdAt || 0);
    });

    return res.status(200).json({
      success: true,
      totalChecked: schemes.length,
      eligibleCount: eligibleSchemes.length,
      eligibleSchemes,
      notEligibleSchemes,
      profileUsed: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard recommendations based on saved profile
// @route   GET /api/eligibility/recommendations
// @access  Public / Private
export const getRecommendations = async (req, res, next) => {
  try {
    // Only ACTIVE schemes are included
    const activeSchemes = await Scheme.find({
      $and: [
        { status: { $in: ['Active', 'ACTIVE', 'active'] } },
        { isActive: { $ne: false } }
      ]
    }).sort({ createdAt: -1 });

    const popular = [...activeSchemes].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    const recentlyAdded = activeSchemes.slice(0, 6);

    let recommended = [];
    let eligibleSchemes = [];
    let notEligibleSchemes = [];
    let isProfileEvaluated = false;

    // If authenticated user, evaluate recommendations against their saved profile
    if (req.user) {
      const user = await User.findById(req.user._id || req.user.id);
      if (user && hasDemographicProfile(user)) {
        isProfileEvaluated = true;
        const profile = {
          age: user.age,
          gender: user.gender,
          state: user.state,
          city: user.city,
          occupation: user.occupation,
          education: user.education,
          annualIncome: user.annualIncome,
          caste: user.caste,
          disabilityStatus: user.disabilityStatus,
          bplStatus: user.bplStatus
        };

        activeSchemes.forEach((scheme) => {
          const result = evaluateSchemeEligibility(scheme, profile);
          if (result.isEligible) {
            eligibleSchemes.push(result);
          } else {
            notEligibleSchemes.push(result);
          }
        });

        // Sort eligible schemes by matchPercentage and recency
        eligibleSchemes.sort((a, b) => {
          if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
          }
          return new Date(b.scheme.createdAt || 0) - new Date(a.scheme.createdAt || 0);
        });

        recommended = eligibleSchemes.map((item) => item.scheme);
      }
    }

    // Fallback if no recommended schemes or user not logged in
    if (recommended.length === 0) {
      recommended = activeSchemes.slice(0, 6);
    }

    return res.status(200).json({
      success: true,
      isProfileEvaluated,
      eligibleCount: eligibleSchemes.length,
      eligibleSchemes,
      notEligibleSchemes,
      recommended: recommended.slice(0, 10),
      popular: popular.slice(0, 6),
      recentlyAdded
    });
  } catch (error) {
    next(error);
  }
};

