import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { SCHEME_CATEGORIES, INDIAN_STATES, SPONSOR_TYPES } from '../utils/constants';
import {
  Calendar,
  IndianRupee,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText,
  Building2,
  Globe,
  Tag
} from 'lucide-react';

export const SchemeModal = ({ isOpen, onClose, onSave, scheme = null, loading = false }) => {
  const isEdit = !!scheme;
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm();

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const watchedNoAgeLimit = watch('noAgeLimit');
  const watchedNoIncomeLimit = watch('noIncomeLimit');
  const watchedLaunchDate = watch('launchDate');
  const watchedLastDate = watch('lastDate');
  const watchedIsActive = watch('isActive');

  // Handle No Age Limit toggle
  useEffect(() => {
    if (watchedNoAgeLimit) {
      setValue('minAge', '');
      setValue('maxAge', '');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.minAge;
        delete next.maxAge;
        return next;
      });
    }
  }, [watchedNoAgeLimit, setValue]);

  // Handle No Income Limit toggle
  useEffect(() => {
    if (watchedNoIncomeLimit) {
      setValue('maxIncome', '');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.maxIncome;
        return next;
      });
    }
  }, [watchedNoIncomeLimit, setValue]);

  // Reset form on open/scheme change
  useEffect(() => {
    setErrors({});
    setTouched({});

    if (scheme) {
      const activeState = scheme.status === 'Active' || scheme.isActive === true;
      const benefitsText = Array.isArray(scheme.benefits)
        ? scheme.benefits.join('\n')
        : typeof scheme.benefits === 'string'
          ? scheme.benefits
          : '';
      const docsText = Array.isArray(scheme.requiredDocuments)
        ? scheme.requiredDocuments.join('\n')
        : Array.isArray(scheme.documentsRequired)
          ? scheme.documentsRequired.join('\n')
          : typeof scheme.requiredDocuments === 'string'
            ? scheme.requiredDocuments
            : '';

      const isNoAge = Boolean(
        scheme.eligibilityCriteria?.noAgeLimit ||
        scheme.eligibility?.noAgeLimit ||
        (scheme.eligibilityCriteria?.minAge === null && scheme.eligibilityCriteria?.maxAge === null) ||
        (scheme.eligibility?.minAge === null && scheme.eligibility?.maxAge === null)
      );

      const isNoIncome = Boolean(
        scheme.eligibilityCriteria?.noIncomeLimit ||
        scheme.eligibility?.noIncomeLimit ||
        scheme.eligibilityCriteria?.maxIncome === null ||
        scheme.eligibility?.maxIncome === null
      );

      const rawMinAge = scheme.eligibilityCriteria?.minAge ?? scheme.eligibility?.minAge ?? '';
      const rawMaxAge = scheme.eligibilityCriteria?.maxAge ?? scheme.eligibility?.maxAge ?? '';
      const rawIncome = scheme.eligibilityCriteria?.maxIncome ?? scheme.eligibility?.maxIncome ?? '';

      reset({
        title: scheme.title || '',
        code: scheme.code || '',
        department: scheme.department || '',
        category: scheme.category || 'General Welfare',
        sponsorType: scheme.sponsorType || 'Central Scheme',
        officialWebsiteUrl: scheme.officialWebsiteUrl || '',
        shortDescription: scheme.shortDescription || '',
        detailedDescription: scheme.detailedDescription || scheme.description || '',
        benefits: benefitsText,
        applicationProcess: scheme.applicationProcess || '',
        requiredDocuments: docsText,
        targetState: scheme.targetStates ? scheme.targetStates[0] : scheme.state || 'All',
        isActive: activeState,

        // Dates
        launchDate: scheme.launchDate || '2019-02-24',
        lastDate: scheme.lastDate || scheme.applicationLastDate || '',

        // Eligibility Rules
        noAgeLimit: isNoAge,
        minAge: isNoAge ? '' : rawMinAge,
        maxAge: isNoAge ? '' : rawMaxAge,
        noIncomeLimit: isNoIncome,
        maxIncome: isNoIncome ? '' : rawIncome,
        disabilityRequired: scheme.eligibilityCriteria?.disabilityRequired || scheme.eligibility?.disabilityRequired ? 'Yes' : 'Any',
        bplRequired: scheme.eligibilityCriteria?.bplRequired || scheme.eligibility?.bplRequired ? 'Yes' : 'Any',
        gender: scheme.eligibilityCriteria?.gender === 'All' ? 'All' : (scheme.eligibilityCriteria?.gender || (Array.isArray(scheme.eligibility?.gender) ? scheme.eligibility?.gender[0] : scheme.eligibility?.gender) || 'All'),
        occupation: Array.isArray(scheme.eligibilityCriteria?.allowedOccupations) ? (scheme.eligibilityCriteria?.allowedOccupations[0] || 'All') : (Array.isArray(scheme.eligibility?.occupations) ? scheme.eligibility?.occupations[0] : 'All'),
        education: Array.isArray(scheme.eligibilityCriteria?.allowedEducations) ? (scheme.eligibilityCriteria?.allowedEducations[0] || 'All') : (Array.isArray(scheme.eligibility?.educationLevels) ? scheme.eligibility?.educationLevels[0] : 'All'),
        caste: Array.isArray(scheme.eligibilityCriteria?.allowedCastes) ? (scheme.eligibilityCriteria?.allowedCastes[0] || 'All') : (Array.isArray(scheme.eligibility?.castes) ? scheme.eligibility?.castes[0] : 'All')
      });
    } else {
      reset({
        title: '',
        code: '',
        department: '',
        category: 'Agriculture & Farmers',
        sponsorType: 'Central Scheme',
        officialWebsiteUrl: '',
        launchDate: new Date().toISOString().split('T')[0],
        lastDate: '',
        shortDescription: '',
        detailedDescription: '',
        benefits: 'Direct financial assistance\nSubsidized inputs',
        applicationProcess: 'Apply online through the official government portal',
        requiredDocuments: 'Aadhaar Card\nIncome Certificate\nBank Passbook',
        targetState: 'All',
        isActive: true,
        noAgeLimit: false,
        minAge: 18,
        maxAge: 70,
        noIncomeLimit: false,
        maxIncome: 250000,
        disabilityRequired: 'Any',
        bplRequired: 'Any',
        gender: 'All',
        occupation: 'All',
        education: 'All',
        caste: 'All'
      });
    }
  }, [scheme, reset, isOpen]);

  // Field validation function
  const validateField = (name, value, allValues = {}) => {
    let error = '';
    const cleanStr = typeof value === 'string' ? value.trim() : (value !== null && value !== undefined ? String(value).trim() : '');

    switch (name) {
      case 'title': {
        if (!cleanStr) {
          error = 'Please enter a valid scheme title.';
        } else if (cleanStr.length < 3) {
          error = 'Scheme title must be at least 3 characters.';
        }
        break;
      }
      case 'department': {
        if (!cleanStr) {
          error = 'Please enter the nodal department.';
        } else if (cleanStr.length < 2) {
          error = 'Please enter the nodal department.';
        }
        break;
      }
      case 'category': {
        if (!cleanStr || cleanStr === 'All') {
          error = 'Please select a scheme category.';
        }
        break;
      }
      case 'sponsorType': {
        if (!cleanStr) {
          error = 'Please select the sponsor type.';
        }
        break;
      }
      case 'officialWebsiteUrl': {
        if (cleanStr) {
          if (!/^https?:\/\/.+/i.test(cleanStr)) {
            error = 'Please enter a valid official website URL.';
          } else {
            try {
              new URL(cleanStr);
            } catch {
              error = 'Please enter a valid official website URL.';
            }
          }
        }
        break;
      }
      case 'lastDate': {
        const launch = (allValues.launchDate || watchedLaunchDate || '').trim();
        const last = cleanStr;
        if (launch && last) {
          const launchTime = new Date(launch).getTime();
          const lastTime = new Date(last).getTime();
          if (!isNaN(launchTime) && !isNaN(lastTime) && lastTime < launchTime) {
            error = 'Last date cannot be earlier than launch date.';
          }
        }
        break;
      }
      case 'shortDescription': {
        if (!cleanStr) {
          error = 'Please enter a short summary description.';
        } else if (cleanStr.length < 5) {
          error = 'Short summary description must be at least 5 characters.';
        }
        break;
      }
      case 'minAge':
      case 'maxAge': {
        const isNoAge = allValues.noAgeLimit ?? watchedNoAgeLimit;
        if (!isNoAge) {
          const rawMin = name === 'minAge' ? cleanStr : (allValues.minAge !== undefined ? String(allValues.minAge).trim() : '');
          const rawMax = name === 'maxAge' ? cleanStr : (allValues.maxAge !== undefined ? String(allValues.maxAge).trim() : '');

          if (rawMin) {
            const minNum = Number(rawMin);
            if (isNaN(minNum) || !Number.isInteger(minNum) || minNum < 0 || minNum > 120) {
              error = 'Minimum age must be a whole number between 0 and 120.';
            }
          }
          if (rawMax) {
            const maxNum = Number(rawMax);
            if (isNaN(maxNum) || !Number.isInteger(maxNum) || maxNum < 0 || maxNum > 120) {
              error = 'Maximum age must be a whole number between 0 and 120.';
            }
          }
          if (rawMin && rawMax) {
            const minNum = Number(rawMin);
            const maxNum = Number(rawMax);
            if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
              error = 'Minimum age cannot be greater than maximum age.';
            }
          }
        }
        break;
      }
      case 'maxIncome': {
        const isNoIncome = allValues.noIncomeLimit ?? watchedNoIncomeLimit;
        if (!isNoIncome && cleanStr) {
          const num = Number(cleanStr);
          if (isNaN(num) || num < 0) {
            error = 'Please enter a valid annual income limit.';
          }
        }
        break;
      }
      default:
        break;
    }
    return error;
  };

  // Live change handler with error clearing
  const handleInputChange = (fieldName, value) => {
    setValue(fieldName, value);
    if (touched[fieldName] || errors[fieldName]) {
      const allVals = getValues();
      const err = validateField(fieldName, value, allVals);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[fieldName] = err;
        } else {
          delete next[fieldName];
        }
        if ((fieldName === 'minAge' || fieldName === 'maxAge') && !err) {
          delete next.minAge;
          delete next.maxAge;
        }
        if (fieldName === 'launchDate' && next.lastDate) {
          const lastErr = validateField('lastDate', allVals.lastDate, allVals);
          if (!lastErr) delete next.lastDate;
        }
        return next;
      });
    }
  };

  // Blur handler
  const handleBlur = (fieldName, value) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const allVals = getValues();
    const err = validateField(fieldName, value, allVals);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[fieldName] = err;
      } else {
        delete next[fieldName];
      }
      return next;
    });
  };

  // Form submission handler
  const onSubmitForm = (data) => {
    if (loading) return;

    const allErrors = {};
    const fieldList = [
      'title',
      'department',
      'category',
      'sponsorType',
      'officialWebsiteUrl',
      'lastDate',
      'shortDescription',
      'minAge',
      'maxAge',
      'maxIncome'
    ];

    fieldList.forEach((field) => {
      const err = validateField(field, data[field], data);
      if (err) allErrors[field] = err;
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched(fieldList.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

      // Find first invalid field and auto-focus / scroll
      const firstInvalidField = fieldList.find((f) => allErrors[f]);
      if (firstInvalidField) {
        const el = document.querySelector(`[name="${firstInvalidField}"]`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Process Age Criteria
    const isNoAge = Boolean(data.noAgeLimit);
    let minAge = null;
    let maxAge = null;

    if (!isNoAge) {
      const rawMin = data.minAge !== '' && data.minAge !== null && data.minAge !== undefined ? Number(data.minAge) : null;
      const rawMax = data.maxAge !== '' && data.maxAge !== null && data.maxAge !== undefined ? Number(data.maxAge) : null;
      minAge = rawMin;
      maxAge = rawMax;
    }

    // Process Income Criteria
    const isNoIncome = Boolean(data.noIncomeLimit);
    let maxIncomeVal = null;
    if (!isNoIncome) {
      const rawMaxInc = data.maxIncome !== '' && data.maxIncome !== null && data.maxIncome !== undefined ? Number(data.maxIncome) : null;
      maxIncomeVal = rawMaxInc;
    }

    // Deduplicate benefits and documents (one per line)
    const cleanBenefits = Array.from(
      new Set(
        (data.benefits || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    const cleanDocs = Array.from(
      new Set(
        (data.requiredDocuments || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    const formattedData = {
      title: data.title?.trim(),
      code: data.code?.trim() || '',
      department: data.department?.trim(),
      category: data.category,
      sponsorType: data.sponsorType || 'Central Scheme',
      officialWebsiteUrl: data.officialWebsiteUrl?.trim() || '',
      launchDate: data.launchDate?.trim() || '2019-02-24',
      lastDate: data.lastDate?.trim() || '',
      applicationLastDate: data.lastDate?.trim() || '',
      shortDescription: data.shortDescription?.trim(),
      description: (data.detailedDescription || data.shortDescription)?.trim(),
      detailedDescription: data.detailedDescription?.trim() || data.shortDescription?.trim(),
      benefits: cleanBenefits,
      applicationProcess: data.applicationProcess?.trim() || 'Apply online through the official government portal',
      requiredDocuments: cleanDocs,
      documentsRequired: cleanDocs,
      targetStates: data.targetState === 'All' ? ['All'] : [data.targetState],
      state: data.targetState === 'All' ? 'All India' : data.targetState,
      isActive: Boolean(data.isActive),
      status: data.isActive ? 'Active' : 'Inactive',
      eligibilityCriteria: {
        noAgeLimit: isNoAge,
        minAge: minAge,
        maxAge: maxAge,
        noIncomeLimit: isNoIncome,
        maxIncome: maxIncomeVal,
        maxAnnualIncome: maxIncomeVal,
        gender: data.gender || 'All',
        allowedOccupations: data.occupation === 'All' ? ['All'] : [data.occupation],
        allowedEducations: data.education === 'All' ? ['All'] : [data.education],
        allowedCastes: data.caste === 'All' ? ['All'] : [data.caste],
        allowedStates: data.targetState === 'All' ? ['All'] : [data.targetState],
        disabilityRequired: data.disabilityRequired === 'Yes',
        bplRequired: data.bplRequired === 'Yes'
      },
      eligibility: {
        noAgeLimit: isNoAge,
        minAge: minAge,
        maxAge: maxAge,
        noIncomeLimit: isNoIncome,
        maxIncome: maxIncomeVal,
        maxAnnualIncome: maxIncomeVal,
        gender: data.gender === 'All' ? ['All'] : [data.gender],
        occupations: data.occupation === 'All' ? ['All'] : [data.occupation],
        educationLevels: data.education === 'All' ? ['All'] : [data.education],
        castes: data.caste === 'All' ? ['All'] : [data.caste],
        allowedStates: data.targetState === 'All' ? ['All'] : [data.targetState],
        disabilityRequired: data.disabilityRequired === 'Yes',
        bplRequired: data.bplRequired === 'Yes'
      }
    };

    onSave(formattedData);
  };

  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 outline-none transition-all ${
      hasError
        ? 'border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500'
        : 'border-slate-300 bg-white focus:ring-2 focus:ring-[#0c2338] focus:border-[#0c2338]'
    }`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Government Scheme' : 'Add New Government Scheme'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="space-y-6">
        
        {/* ================================================================= */}
        {/* 1. BASIC SCHEME INFORMATION                                       */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Building2 className="w-4 h-4 text-[#0c2338]" />
            <h4 className="text-xs font-black text-[#0c2338] uppercase tracking-wider">
              1. Basic Scheme Information
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scheme Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Scheme Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                {...register('title')}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={(e) => handleBlur('title', e.target.value)}
                className={getFieldClass('title')}
              />
              {errors.title && touched.title && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Scheme Code / Acronym */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Scheme Code / Acronym
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g. PM-KISAN"
                {...register('code')}
                onChange={(e) => handleInputChange('code', e.target.value)}
                onBlur={(e) => handleBlur('code', e.target.value)}
                className={getFieldClass('code')}
              />
              {errors.code && touched.code && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.code}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nodal Department */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Nodal Department *
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Ministry of Agriculture"
                {...register('department')}
                onChange={(e) => handleInputChange('department', e.target.value)}
                onBlur={(e) => handleBlur('department', e.target.value)}
                className={getFieldClass('department')}
              />
              {errors.department && touched.department && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.department}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Category *
              </label>
              <select
                name="category"
                {...register('category')}
                onChange={(e) => handleInputChange('category', e.target.value)}
                onBlur={(e) => handleBlur('category', e.target.value)}
                className={getFieldClass('category')}
              >
                {SCHEME_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && touched.category && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Sponsor Type */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Sponsor Type *
              </label>
              <select
                name="sponsorType"
                {...register('sponsorType')}
                onChange={(e) => handleInputChange('sponsorType', e.target.value)}
                onBlur={(e) => handleBlur('sponsorType', e.target.value)}
                className={getFieldClass('sponsorType')}
              >
                {SPONSOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.sponsorType && touched.sponsorType && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.sponsorType}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Official Website URL */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Official Website URL
              </label>
              <input
                type="url"
                name="officialWebsiteUrl"
                placeholder="https://pmkisan.gov.in"
                {...register('officialWebsiteUrl')}
                onChange={(e) => handleInputChange('officialWebsiteUrl', e.target.value)}
                onBlur={(e) => handleBlur('officialWebsiteUrl', e.target.value)}
                className={getFieldClass('officialWebsiteUrl')}
              />
              {errors.officialWebsiteUrl && touched.officialWebsiteUrl && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.officialWebsiteUrl}</span>
                </p>
              )}
            </div>

            {/* Launch Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Launch Date *
              </label>
              <input
                type="date"
                name="launchDate"
                {...register('launchDate')}
                onChange={(e) => handleInputChange('launchDate', e.target.value)}
                onBlur={(e) => handleBlur('launchDate', e.target.value)}
                className={getFieldClass('launchDate')}
              />
              {errors.launchDate && touched.launchDate && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.launchDate}</span>
                </p>
              )}
            </div>

            {/* Last Date / Application Deadline */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Last Date / Application Deadline (Optional)
              </label>
              <input
                type="date"
                name="lastDate"
                {...register('lastDate')}
                onChange={(e) => handleInputChange('lastDate', e.target.value)}
                onBlur={(e) => handleBlur('lastDate', e.target.value)}
                className={getFieldClass('lastDate')}
              />
              {errors.lastDate && touched.lastDate && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.lastDate}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. DESCRIPTIONS & PROCESS                                         */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileText className="w-4 h-4 text-[#0c2338]" />
            <h4 className="text-xs font-black text-[#0c2338] uppercase tracking-wider">
              2. Descriptions & Process
            </h4>
          </div>

          {/* Short Summary Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Short Summary Description *
            </label>
            <textarea
              rows={2}
              name="shortDescription"
              placeholder="Brief 1-2 sentence overview for scheme card display"
              {...register('shortDescription')}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              onBlur={(e) => handleBlur('shortDescription', e.target.value)}
              className={getFieldClass('shortDescription')}
            />
            {errors.shortDescription && touched.shortDescription && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.shortDescription}</span>
              </p>
            )}
          </div>

          {/* Detailed Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Detailed Description
            </label>
            <textarea
              rows={3}
              name="detailedDescription"
              placeholder="Comprehensive details about objectives, target audience, and scope"
              {...register('detailedDescription')}
              onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
              onBlur={(e) => handleBlur('detailedDescription', e.target.value)}
              className={getFieldClass('detailedDescription')}
            />
            {errors.detailedDescription && touched.detailedDescription && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.detailedDescription}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Benefits */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Key Benefits (One per line)
              </label>
              <textarea
                rows={3}
                name="benefits"
                placeholder="Direct financial assistance&#10;Subsidized inputs"
                {...register('benefits')}
                className={getFieldClass('benefits')}
              />
            </div>

            {/* Required Documents */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Required Documents (One per line)
              </label>
              <textarea
                rows={3}
                name="requiredDocuments"
                placeholder="Aadhaar Card&#10;Income Certificate&#10;Bank Passbook"
                {...register('requiredDocuments')}
                className={getFieldClass('requiredDocuments')}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. AUTOMATED ELIGIBILITY CRITERIA BOUNDS                          */}
        {/* ================================================================= */}
        <div className="space-y-4 bg-amber-50/40 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="border-b border-amber-200/80 pb-2.5">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
              3. Automated Eligibility Criteria Bounds
            </h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5 font-medium">
              Configure parameters evaluated by the automated engine to match citizen profiles with this scheme.
            </p>
          </div>

          {/* AGE CRITERIA */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Age Criteria
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className={`block text-xs font-bold ${watchedNoAgeLimit ? 'text-slate-400' : 'text-slate-700'}`}>
                  Minimum Age (1–120)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  step={1}
                  disabled={watchedNoAgeLimit}
                  placeholder={watchedNoAgeLimit ? 'No Age Limit' : 'e.g. 18'}
                  name="minAge"
                  {...register('minAge')}
                  onChange={(e) => handleInputChange('minAge', e.target.value)}
                  onBlur={(e) => handleBlur('minAge', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none ${
                    watchedNoAgeLimit
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : errors.minAge && touched.minAge
                        ? 'border-red-500 bg-red-50/20 text-slate-800'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#0c2338]'
                  }`}
                />
                {errors.minAge && touched.minAge && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.minAge}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-bold ${watchedNoAgeLimit ? 'text-slate-400' : 'text-slate-700'}`}>
                  Maximum Age (1–120)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  step={1}
                  disabled={watchedNoAgeLimit}
                  placeholder={watchedNoAgeLimit ? 'No Age Limit' : 'e.g. 70'}
                  name="maxAge"
                  {...register('maxAge')}
                  onChange={(e) => handleInputChange('maxAge', e.target.value)}
                  onBlur={(e) => handleBlur('maxAge', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none ${
                    watchedNoAgeLimit
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : errors.maxAge && touched.maxAge
                        ? 'border-red-500 bg-red-50/20 text-slate-800'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#0c2338]'
                  }`}
                />
                {errors.maxAge && touched.maxAge && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.maxAge}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="noAgeLimitCheck"
                  className={`flex items-center gap-2.5 h-[42px] px-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    watchedNoAgeLimit
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="noAgeLimitCheck"
                    {...register('noAgeLimit')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold">No Age Limit</span>
                </label>
              </div>
            </div>
          </div>

          {/* INCOME CRITERIA */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Income Criteria
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-8 space-y-1">
                <label className={`block text-xs font-bold ${watchedNoIncomeLimit ? 'text-slate-400' : 'text-slate-700'}`}>
                  Max Annual Income Ceiling (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  disabled={watchedNoIncomeLimit}
                  placeholder={watchedNoIncomeLimit ? 'No Income Limit' : 'e.g. 250000'}
                  name="maxIncome"
                  {...register('maxIncome')}
                  onChange={(e) => handleInputChange('maxIncome', e.target.value)}
                  onBlur={(e) => handleBlur('maxIncome', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none ${
                    watchedNoIncomeLimit
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : errors.maxIncome && touched.maxIncome
                        ? 'border-red-500 bg-red-50/20 text-slate-800'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#0c2338]'
                  }`}
                />
                {errors.maxIncome && touched.maxIncome && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.maxIncome}</span>
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <label
                  htmlFor="noIncomeLimitCheck"
                  className={`flex items-center gap-2.5 h-[42px] px-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    watchedNoIncomeLimit
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="noIncomeLimitCheck"
                    {...register('noIncomeLimit')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold">No Income Limit</span>
                </label>
              </div>
            </div>
          </div>

          {/* DEMOGRAPHIC CRITERIA */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Demographic Criteria
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Gender</label>
                <select {...register('gender')} className={getFieldClass('gender')}>
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Occupation</label>
                <select {...register('occupation')} className={getFieldClass('occupation')}>
                  <option value="All">All Occupations</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Student">Student</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Target Caste</label>
                <select {...register('caste')} className={getFieldClass('caste')}>
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Target State</label>
                <select {...register('targetState')} className={getFieldClass('targetState')}>
                  <option value="All">All States / All India</option>
                  {INDIAN_STATES.filter((st) => st !== 'All').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ADDITIONAL ELIGIBILITY & VISIBILITY */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Additional Eligibility & Visibility
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Disability Required</label>
                <select {...register('disabilityRequired')} className={getFieldClass('disabilityRequired')}>
                  <option value="Any">Any / No Restriction</option>
                  <option value="Yes">Must be Person with Disability (PwD)</option>
                  <option value="No">Non-Disabled Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">BPL Status Required</label>
                <select {...register('bplRequired')} className={getFieldClass('bplRequired')}>
                  <option value="Any">No Restriction</option>
                  <option value="Yes">Must possess BPL Ration Card</option>
                  <option value="No">Non-BPL Only</option>
                </select>
              </div>
            </div>

            {/* Scheme Active & Publicly Visible Setting */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors">
              <label htmlFor="isActiveCheck" className="flex items-center justify-between cursor-pointer select-none">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Scheme Active & Publicly Visible</span>
                    {watchedIsActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    When active, this scheme is processed in automated eligibility matches and visible on public listings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-[#0c2338] focus:ring-[#0c2338] cursor-pointer flex-shrink-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#0c2338] hover:bg-[#071928] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Scheme...</span>
              </>
            ) : (
              <span>{isEdit ? 'Update Scheme' : 'Publish Scheme'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SchemeModal;
