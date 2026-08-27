import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { SCHEME_CATEGORIES, INDIAN_STATES, SPONSOR_TYPES } from '../utils/constants';

export const SchemeModal = ({ isOpen, onClose, onSave, scheme = null, loading = false }) => {
  const isEdit = !!scheme;
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [formError, setFormError] = useState(null);

  const watchedNoAgeLimit = watch('noAgeLimit');
  const watchedMinAge = watch('minAge');
  const watchedMaxAge = watch('maxAge');

  useEffect(() => {
    setFormError(null);
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
        (scheme.eligibility?.minAge === null && scheme.eligibility?.maxAge === null) ||
        ((scheme.eligibilityCriteria?.minAge === 0 || scheme.eligibilityCriteria?.minAge === undefined) && 
         (scheme.eligibilityCriteria?.maxAge === 0 || scheme.eligibilityCriteria?.maxAge === 100 || scheme.eligibilityCriteria?.maxAge === 120 || scheme.eligibilityCriteria?.maxAge === undefined))
      );

      const rawMinAge = scheme.eligibilityCriteria?.minAge ?? scheme.eligibility?.minAge ?? '';
      const rawMaxAge = scheme.eligibilityCriteria?.maxAge ?? scheme.eligibility?.maxAge ?? '';

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

        // Eligibility Rules
        noAgeLimit: isNoAge,
        minAge: isNoAge ? '' : rawMinAge,
        maxAge: isNoAge ? '' : rawMaxAge,
        maxIncome: scheme.eligibilityCriteria?.maxIncome ?? scheme.eligibility?.maxIncome ?? 500000,
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

  const onSubmitForm = (data) => {
    const isNoAge = Boolean(data.noAgeLimit);
    let minAge = null;
    let maxAge = null;

    if (!isNoAge) {
      const minVal = data.minAge !== '' && data.minAge !== null && data.minAge !== undefined ? Number(data.minAge) : null;
      const maxVal = data.maxAge !== '' && data.maxAge !== null && data.maxAge !== undefined ? Number(data.maxAge) : null;

      if (minVal !== null) {
        if (!Number.isInteger(minVal) || minVal < 1 || minVal > 120) {
          setFormError('Minimum age must be an integer between 1 and 120 (or select No Age Limit).');
          return;
        }
        minAge = minVal;
      }

      if (maxVal !== null) {
        if (!Number.isInteger(maxVal) || maxVal < 1 || maxVal > 120) {
          setFormError('Maximum age must be an integer between 1 and 120 (or select No Age Limit).');
          return;
        }
        maxAge = maxVal;
      }

      if (minAge !== null && maxAge !== null && minAge > maxAge) {
        setFormError('Minimum age cannot be greater than maximum age.');
        return;
      }
    }

    setFormError(null);

    const formattedData = {
      title: data.title?.trim(),
      code: data.code?.trim() || '',
      department: data.department?.trim(),
      category: data.category,
      sponsorType: data.sponsorType || 'Central Scheme',
      officialWebsiteUrl: data.officialWebsiteUrl?.trim() || '',
      shortDescription: data.shortDescription?.trim(),
      description: (data.detailedDescription || data.shortDescription)?.trim(),
      detailedDescription: data.detailedDescription?.trim() || data.shortDescription?.trim(),
      benefits: data.benefits ? data.benefits.split('\n').map(s => s.trim()).filter(Boolean) : [],
      applicationProcess: data.applicationProcess?.trim() || 'Apply online through the official government portal',
      requiredDocuments: data.requiredDocuments ? data.requiredDocuments.split('\n').map(s => s.trim()).filter(Boolean) : [],
      documentsRequired: data.requiredDocuments ? data.requiredDocuments.split('\n').map(s => s.trim()).filter(Boolean) : [],
      targetStates: data.targetState === 'All' ? ['All'] : [data.targetState],
      state: data.targetState === 'All' ? 'All India' : data.targetState,
      isActive: Boolean(data.isActive),
      status: data.isActive ? 'Active' : 'Inactive',
      eligibilityCriteria: {
        noAgeLimit: isNoAge,
        minAge: minAge,
        maxAge: maxAge,
        maxIncome: Number(data.maxIncome) || 10000000,
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
        maxIncome: Number(data.maxIncome) || 10000000,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Government Scheme' : 'Add New Government Scheme'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Basic Scheme Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b pb-1">
            1. Basic Scheme Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheme Title *
              </label>
              <input
                type="text"
                {...register('title', { required: true })}
                placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheme Code / Acronym
              </label>
              <input
                type="text"
                {...register('code')}
                placeholder="e.g. PM-KISAN"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nodal Department *
              </label>
              <input
                type="text"
                {...register('department', { required: true })}
                placeholder="e.g. Ministry of Agriculture"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {SCHEME_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sponsor Type
              </label>
              <select
                {...register('sponsorType')}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {SPONSOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Website URL
            </label>
            <input
              type="url"
              {...register('officialWebsiteUrl')}
              placeholder="https://pmkisan.gov.in"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Descriptions & Content */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b pb-1">
            2. Descriptions & Process
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary Description *
            </label>
            <textarea
              {...register('shortDescription', { required: true })}
              rows={2}
              placeholder="Brief 1-2 sentence overview for scheme card display"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              {...register('detailedDescription')}
              rows={3}
              placeholder="Comprehensive details about objectives, target audience, and scope"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Benefits (One per line)
              </label>
              <textarea
                {...register('benefits')}
                rows={3}
                placeholder="Direct Bank Transfer ₹6,000 per year&#10;Paid in 3 equal installments"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Documents (One per line)
              </label>
              <textarea
                {...register('requiredDocuments')}
                rows={3}
                placeholder="Aadhaar Card&#10;Land Ownership Record&#10;Bank Passbook"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Eligibility Engine Rules */}
        <div className="space-y-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
              3. Automated Eligibility Criteria Bounds
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noAgeLimitCheck"
                {...register('noAgeLimit')}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="noAgeLimitCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
                No Age Limit
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${watchedNoAgeLimit ? 'text-slate-400' : 'text-slate-700'}`}>
                Minimum Age (1–120)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                disabled={watchedNoAgeLimit}
                placeholder={watchedNoAgeLimit ? 'No Age Limit' : 'e.g. 18'}
                {...register('minAge')}
                className={`w-full px-3 py-2 border rounded-xl text-sm ${watchedNoAgeLimit ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${watchedNoAgeLimit ? 'text-slate-400' : 'text-slate-700'}`}>
                Maximum Age (1–120)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                disabled={watchedNoAgeLimit}
                placeholder={watchedNoAgeLimit ? 'No Age Limit' : 'e.g. 70'}
                {...register('maxAge')}
                className={`w-full px-3 py-2 border rounded-xl text-sm ${watchedNoAgeLimit ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Annual Income Ceiling (₹)</label>
              <input
                type="number"
                min={0}
                step={1000}
                {...register('maxIncome')}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select {...register('gender')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <select {...register('occupation')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="All">All Occupations</option>
                <option value="Farmer">Farmer</option>
                <option value="Student">Student</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Salaried">Salaried</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Caste</label>
              <select {...register('caste')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target State</label>
              <select {...register('targetState')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="All">All States / All India</option>
                {INDIAN_STATES.filter((st) => st !== 'All').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Disability Required</label>
              <select {...register('disabilityRequired')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="Any">Any / No Restriction</option>
                <option value="Yes">Must be Person with Disability (PwD)</option>
                <option value="No">Non-Disabled Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">BPL Status Required</label>
              <select {...register('bplRequired')} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="Any">No Restriction</option>
                <option value="Yes">Must possess BPL Ration Card</option>
                <option value="No">Non-BPL Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActiveCheck"
                {...register('isActive')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Scheme Active & Publicly Visible
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Scheme' : 'Publish Scheme'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
