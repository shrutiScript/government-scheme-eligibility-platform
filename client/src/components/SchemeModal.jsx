import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { SCHEME_CATEGORIES, INDIAN_STATES, SPONSOR_TYPES } from '../utils/constants';

export const SchemeModal = ({ isOpen, onClose, onSave, scheme = null, loading = false }) => {
  const isEdit = !!scheme;
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
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
        minAge: scheme.eligibility?.minAge ?? scheme.eligibilityCriteria?.minAge ?? 0,
        maxAge: scheme.eligibility?.maxAge ?? scheme.eligibilityCriteria?.maxAge ?? 100,
        maxIncome: scheme.eligibility?.maxIncome ?? scheme.eligibilityCriteria?.maxIncome ?? 500000,
        disabilityRequired: scheme.eligibility?.disabilityRequired || scheme.eligibilityCriteria?.disabilityRequired ? 'Yes' : 'Any',
        bplRequired: scheme.eligibility?.bplRequired || scheme.eligibilityCriteria?.bplRequired ? 'Yes' : 'Any',
        gender: scheme.eligibility?.gender?.includes('All') ? 'All' : (Array.isArray(scheme.eligibility?.gender) ? scheme.eligibility?.gender[0] : scheme.eligibility?.gender) || 'All',
        occupation: scheme.eligibility?.occupations?.includes('All') ? 'All' : (Array.isArray(scheme.eligibility?.occupations) ? scheme.eligibility?.occupations[0] : 'All'),
        education: scheme.eligibility?.educationLevels?.includes('All') ? 'All' : (Array.isArray(scheme.eligibility?.educationLevels) ? scheme.eligibility?.educationLevels[0] : 'All'),
        caste: scheme.eligibility?.castes?.includes('All') ? 'All' : (Array.isArray(scheme.eligibility?.castes) ? scheme.eligibility?.castes[0] : 'All')
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
    const formattedData = {
      title: data.title,
      code: data.code,
      department: data.department,
      category: data.category,
      sponsorType: data.sponsorType,
      officialWebsiteUrl: data.officialWebsiteUrl,
      shortDescription: data.shortDescription,
      description: data.detailedDescription || data.shortDescription,
      detailedDescription: data.detailedDescription,
      benefits: data.benefits ? data.benefits.split('\n').filter((line) => line.trim()) : [],
      applicationProcess: data.applicationProcess,
      requiredDocuments: data.requiredDocuments ? data.requiredDocuments.split('\n').filter((line) => line.trim()) : [],
      documentsRequired: data.requiredDocuments ? data.requiredDocuments.split('\n').filter((line) => line.trim()) : [],
      targetStates: [data.targetState],
      state: data.targetState === 'All' ? 'All India' : data.targetState,
      isActive: Boolean(data.isActive),
      status: data.isActive ? 'Active' : 'Inactive',
      eligibility: {
        minAge: Number(data.minAge),
        maxAge: Number(data.maxAge),
        maxIncome: Number(data.maxIncome),
        gender: data.gender === 'All' ? ['All'] : [data.gender],
        occupations: data.occupation === 'All' ? ['All'] : [data.occupation],
        educationLevels: data.education === 'All' ? ['All'] : [data.education],
        castes: data.caste === 'All' ? ['All'] : [data.caste],
        allowedStates: data.targetState === 'All' ? ['All'] : [data.targetState],
        disabilityRequired: data.disabilityRequired === 'Yes',
        bplRequired: data.bplRequired === 'Yes'
      },
      eligibilityCriteria: {
        minAge: Number(data.minAge),
        maxAge: Number(data.maxAge),
        maxIncome: Number(data.maxIncome),
        gender: data.gender,
        allowedOccupations: data.occupation === 'All' ? ['All'] : [data.occupation],
        allowedEducations: data.education === 'All' ? ['All'] : [data.education],
        allowedCastes: data.caste === 'All' ? ['All'] : [data.caste],
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
          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider border-b border-amber-200 pb-1">
            3. Automated Eligibility Criteria Engine Bounds
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Age (Years)</label>
              <input
                type="number"
                {...register('minAge')}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Age (Years)</label>
              <input
                type="number"
                {...register('maxAge')}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Annual Income Ceiling (₹)</label>
              <input
                type="number"
                {...register('maxIncome')}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              />
            </div>
          </div>

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
                {INDIAN_STATES.map((st) => (
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
                <option value="Any">Any / No Restriction</option>
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
