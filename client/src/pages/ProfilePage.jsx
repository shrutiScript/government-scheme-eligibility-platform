import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Save,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  INDIAN_STATES,
  STATE_CITIES,
  getCitiesByState,
  OCCUPATIONS,
  EDUCATION_LEVELS,
  CASTE_CATEGORIES,
  GENDERS
} from '../utils/constants';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUserState, runBackgroundEligibilityCheck } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    age: '',
    gender: '',
    state: '',
    city: '',
    occupation: '',
    education: '',
    annualIncome: '',
    caste: '',
    disabilityStatus: false,
    bplStatus: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFindingSchemes, setIsFindingSchemes] = useState(false);

  const userId = user?._id || user?.id;

  // Load fresh profile directly from MongoDB whenever user or userId changes
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);

    const fetchLatestProfile = async () => {
      try {
        const res = await userService.getProfile();
        const usr = res?.user || res?.data?.user || res;
        if (usr && isMounted) {
          setFormData({
            name: usr.name || '',
            mobileNumber: usr.mobileNumber || usr.phone || '',
            age: usr.age !== null && usr.age !== undefined ? String(usr.age) : '',
            gender: usr.gender || '',
            state: usr.state || '',
            city: usr.city || '',
            occupation: usr.occupation || '',
            education: usr.education || '',
            annualIncome: usr.annualIncome !== null && usr.annualIncome !== undefined ? String(usr.annualIncome) : '',
            caste: usr.caste || '',
            disabilityStatus: Boolean(usr.disabilityStatus),
            bplStatus: Boolean(usr.bplStatus)
          });
          updateUserState(usr);
        }
      } catch (err) {
        console.error('Failed to load profile from database:', err);
        if (user && isMounted) {
          setFormData({
            name: user.name || '',
            mobileNumber: user.mobileNumber || user.phone || '',
            age: user.age !== null && user.age !== undefined ? String(user.age) : '',
            gender: user.gender || '',
            state: user.state || '',
            city: user.city || '',
            occupation: user.occupation || '',
            education: user.education || '',
            annualIncome: user.annualIncome !== null && user.annualIncome !== undefined ? String(user.annualIncome) : '',
            caste: user.caste || '',
            disabilityStatus: Boolean(user.disabilityStatus),
            bplStatus: Boolean(user.bplStatus)
          });
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchLatestProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Field Validation Rules
  const validateField = (fieldName, value, currentFormData = formData) => {
    let error = '';

    switch (fieldName) {
      case 'name': {
        const clean = typeof value === 'string' ? value.trim() : '';
        if (!clean) {
          error = 'Please enter your full name.';
        } else if (clean.length < 2 || !/^[a-zA-Z\s]+$/.test(clean)) {
          error = 'Please enter a valid full name.';
        }
        break;
      }
      case 'mobileNumber': {
        const clean = typeof value === 'string' ? value.trim() : (value !== undefined && value !== null ? String(value).trim() : '');
        if (!clean) {
          error = 'Please enter a valid 10-digit mobile number.';
        } else if (!/^[6-9]\d{9}$/.test(clean) && !/^\d{10}$/.test(clean)) {
          error = 'Please enter a valid 10-digit mobile number.';
        }
        break;
      }
      case 'age': {
        if (value === '' || value === null || value === undefined) {
          error = 'Age must be between 1 and 120 years.';
        } else {
          const parsed = Number(value);
          if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
            error = 'Age must be between 1 and 120 years.';
          }
        }
        break;
      }
      case 'gender': {
        const validGenders = ['Male', 'Female', 'Transgender', 'Other'];
        if (!value || !validGenders.includes(value)) {
          error = 'Please select your gender.';
        }
        break;
      }
      case 'annualIncome': {
        if (value === '' || value === null || value === undefined) {
          error = 'Please enter a valid annual income.';
        } else {
          const parsed = Number(value);
          if (isNaN(parsed) || parsed < 0) {
            error = 'Please enter a valid annual income.';
          }
        }
        break;
      }
      case 'state': {
        if (!value || value === 'Select State' || value.toLowerCase() === 'all') {
          error = 'Please select your state.';
        }
        break;
      }
      case 'city': {
        if (!value || value === 'Select City' || value === 'Select State first') {
          error = 'Please select your city.';
        }
        break;
      }
      case 'occupation': {
        if (!value || value === 'Select Occupation' || value.toLowerCase() === 'all') {
          error = 'Please select your occupation.';
        }
        break;
      }
      case 'education': {
        if (!value || value === 'Select Education Level' || value.toLowerCase() === 'all') {
          error = 'Please select your education level.';
        }
        break;
      }
      case 'caste': {
        if (!value || value === 'Select Social Category' || value.toLowerCase() === 'all') {
          error = 'Please select your social category.';
        }
        break;
      }
      default:
        break;
    }

    return error;
  };

  // Validate entire form
  const validateForm = (data = formData) => {
    const requiredFields = [
      'name',
      'mobileNumber',
      'age',
      'gender',
      'annualIncome',
      'state',
      'city',
      'occupation',
      'education',
      'caste'
    ];
    const newErrors = {};

    for (const field of requiredFields) {
      const err = validateField(field, data[field], data);
      if (err) {
        newErrors[field] = err;
      }
    }

    return newErrors;
  };

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    const fields = [
      formData.name,
      formData.mobileNumber,
      formData.age,
      formData.gender,
      formData.state,
      formData.city,
      formData.occupation,
      formData.education,
      formData.annualIncome,
      formData.caste
    ];
    const filled = fields.filter((f) => f !== '' && f !== null && f !== undefined).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Dependent Cities list based on selected State
  const availableCities = useMemo(() => {
    return formData.state ? getCitiesByState(formData.state) : [];
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let sanitizedValue = type === 'checkbox' ? checked : value;

    // Strict input filtering per field
    if (name === 'mobileNumber') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'age') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'annualIncome') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    const nextFormData = {
      ...formData,
      [name]: sanitizedValue
    };

    if (name === 'state') {
      // When State changes: reset selected city
      nextFormData.city = '';
    }

    setFormData(nextFormData);

    // If field was already touched or has error, validate live on change and remove error as soon as valid
    if (touched[name] || errors[name]) {
      const fieldError = validateField(name, sanitizedValue, nextFormData);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldError) {
          next[name] = fieldError;
        } else {
          delete next[name];
        }
        if (name === 'state' && prev.city) {
          // Re-evaluate city error
          const cityErr = validateField('city', '', nextFormData);
          if (cityErr) next.city = cityErr;
        }
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value, formData);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[name] = fieldError;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isFindingSchemes) return; // Prevent duplicate requests

    // 1. Run full form validation
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all fields as touched so error borders & messages appear
      const allTouched = {
        name: true,
        mobileNumber: true,
        age: true,
        gender: true,
        annualIncome: true,
        state: true,
        city: true,
        occupation: true,
        education: true,
        caste: true
      };
      setTouched(allTouched);

      // 2. Identify first invalid field in order and auto-focus/scroll
      const fieldOrder = [
        'name',
        'mobileNumber',
        'age',
        'gender',
        'annualIncome',
        'state',
        'city',
        'occupation',
        'education',
        'caste'
      ];
      const firstErrorField = fieldOrder.find((f) => validationErrors[f]);

      if (firstErrorField) {
        notifyError(validationErrors[firstErrorField]);
        setTimeout(() => {
          const el = document.querySelector(`[name="${firstErrorField}"]`);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
      return;
    }

    // 2. Format and sanitize payload
    const payload = {
      name: formData.name.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      annualIncome: Number(formData.annualIncome),
      state: formData.state.trim(),
      city: formData.city.trim(),
      occupation: formData.occupation.trim(),
      education: formData.education.trim(),
      caste: formData.caste.trim(),
      disabilityStatus: Boolean(formData.disabilityStatus),
      bplStatus: Boolean(formData.bplStatus)
    };

    setLoading(true);
    try {
      // 3. Send update request to MongoDB
      const res = await userService.updateProfile(payload);
      const updatedUser = res?.user || res?.data?.user;

      if (updatedUser) {
        // 4. Synchronize memory state & storage with latest MongoDB document
        updateUserState(updatedUser);
        setFormData({
          name: updatedUser.name || '',
          mobileNumber: updatedUser.mobileNumber || updatedUser.phone || '',
          age: updatedUser.age !== null && updatedUser.age !== undefined ? String(updatedUser.age) : '',
          gender: updatedUser.gender || '',
          state: updatedUser.state || '',
          city: updatedUser.city || '',
          occupation: updatedUser.occupation || '',
          education: updatedUser.education || '',
          annualIncome: updatedUser.annualIncome !== null && updatedUser.annualIncome !== undefined ? String(updatedUser.annualIncome) : '',
          caste: updatedUser.caste || '',
          disabilityStatus: Boolean(updatedUser.disabilityStatus),
          bplStatus: Boolean(updatedUser.bplStatus)
        });
        setErrors({});

        // 5. Show clear single success toast
        notifySuccess('Profile updated successfully');

        // 6. Show the existing transition screen ("Finding Your Eligible Schemes...")
        setIsFindingSchemes(true);

        // 7. Trigger immediate fresh background eligibility evaluation with new profile data
        await runBackgroundEligibilityCheck(updatedUser);

        // 8. After short visual transition, navigate to dashboard with updated active schemes
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1400);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to update profile.';
      notifyError(errMsg);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      setIsFindingSchemes(false);
      setLoading(false);
    }
  };

  const completionPct = calculateCompletion();

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#0f2942] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading your profile data...</p>
      </div>
    );
  }

  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all disabled:opacity-60 ${
      hasError
        ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900'
        : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900'
    }`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* PREMIUM FULL-SCREEN FINDING SCHEMES TRANSITION SCREEN */}
      {isFindingSchemes && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl border border-slate-200 animate-card-enter">
            {/* Glowing Tricolor Pulse Ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-amber-500 border-r-[#0f2942] border-b-emerald-600 animate-spin"></div>
              <div className="w-16 h-16 rounded-full bg-[#0f2942] text-amber-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Finding Your Eligible Schemes...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Please wait while we find schemes based on your profile.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0f2942] via-[#e07a10] to-emerald-600 animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar Container - 1st Letter of Name */}
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-[#0f2942] text-[#e07a10] font-black text-4xl flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-slate-100/80 select-none">
              {formData.name ? formData.name.trim().charAt(0).toUpperCase() : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900">{formData.name || user?.name}</h1>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 font-medium">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200">
              Role: {user?.role || 'Citizen'}
            </span>
          </div>
        </div>

        {/* Profile Completion & Dashboard CTA */}
        <div className="w-full sm:w-64 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Profile Completion</span>
            <span className="text-[#0f2942]">{completionPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0f2942] to-[#e07a10] transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            ></div>
          </div>
          <Link
            to="/dashboard"
            className="w-full py-2 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer block text-center mt-2"
          >
            <span>View Eligible Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} noValidate className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-8">
        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <User className="w-4 h-4 text-[#0f2942]" />
            1. Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
                placeholder="e.g. Rahul Sharma"
                disabled={loading || isFindingSchemes}
                className={getFieldClass('name')}
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="name-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                placeholder="10-digit mobile number"
                disabled={loading || isFindingSchemes}
                className={getFieldClass('mobileNumber')}
              />
              {errors.mobileNumber && touched.mobileNumber && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="mobileNumber-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.mobileNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Demographic Criteria for Eligibility Engine */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-[#e07a10]" />
            2. Scheme Eligibility Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Age (Years) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={3}
                placeholder="e.g. 25"
                disabled={loading || isFindingSchemes}
                className={getFieldClass('age')}
              />
              {errors.age && touched.age && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="age-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes}
                className={`${getFieldClass('gender')} cursor-pointer`}
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && touched.gender && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="gender-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.gender}</span>
                </p>
              )}
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Income (₹) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                placeholder="e.g. 180000"
                disabled={loading || isFindingSchemes}
                className={getFieldClass('annualIncome')}
              />
              {errors.annualIncome && touched.annualIncome && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="annualIncome-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.annualIncome}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* State of Residence */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State of Residence *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes}
                className={`${getFieldClass('state')} cursor-pointer`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.filter((s) => s !== 'All').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && touched.state && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="state-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.state}</span>
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City {formData.state ? `(${formData.state})` : ''} *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes || !formData.state}
                className={`${getFieldClass('city')} disabled:cursor-not-allowed cursor-pointer`}
              >
                <option value="">
                  {!formData.state ? 'Select State first' : 'Select City'}
                </option>
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
                {Boolean(formData.city && !availableCities.includes(formData.city)) && (
                  <option value={formData.city}>{formData.city}</option>
                )}
              </select>
              {errors.city && touched.city && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="city-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Occupation *
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes}
                className={`${getFieldClass('occupation')} cursor-pointer`}
              >
                <option value="">Select Occupation</option>
                {OCCUPATIONS.filter((o) => o !== 'All').map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
              {errors.occupation && touched.occupation && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="occupation-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.occupation}</span>
                </p>
              )}
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level *
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes}
                className={`${getFieldClass('education')} cursor-pointer`}
              >
                <option value="">Select Education Level</option>
                {EDUCATION_LEVELS.filter((e) => e !== 'All').map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
              {errors.education && touched.education && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="education-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.education}</span>
                </p>
              )}
            </div>

            {/* Social Category / Caste */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Social Category / Caste *
              </label>
              <select
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || isFindingSchemes}
                className={`${getFieldClass('caste')} cursor-pointer`}
              >
                <option value="">Select Social Category</option>
                {CASTE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.caste && touched.caste && (
                <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in" id="caste-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.caste}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="disabilityProfile"
                name="disabilityStatus"
                checked={formData.disabilityStatus}
                onChange={handleChange}
                disabled={loading || isFindingSchemes}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="disabilityProfile" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Person with Disability (PwD)
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="bplProfile"
                name="bplStatus"
                checked={formData.bplStatus}
                onChange={handleChange}
                disabled={loading || isFindingSchemes}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="bplProfile" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Below Poverty Line (BPL Ration Card Holder)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || isFindingSchemes}
            className="px-8 py-3.5 bg-[#e07a10] hover:bg-[#c96a0b] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading || isFindingSchemes ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
