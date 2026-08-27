import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { 
  INDIAN_STATES, 
  OCCUPATIONS, 
  EDUCATION_LEVELS, 
  CASTE_CATEGORIES, 
  GENDERS,
  getCitiesByState 
} from '../utils/constants';

export const UserEditModal = ({ isOpen, onClose, onSave, user = null, loading = false }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [formError, setFormError] = useState(null);

  const selectedState = watch('state');
  const availableCities = getCitiesByState(selectedState);

  useEffect(() => {
    setFormError(null);
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        age: user.age !== null && user.age !== undefined ? user.age : '',
        gender: user.gender || 'Male',
        state: user.state || 'Gujarat',
        city: user.city || '',
        occupation: user.occupation || 'Student',
        education: user.education || 'Graduate',
        annualIncome: user.annualIncome !== null && user.annualIncome !== undefined ? user.annualIncome : 200000,
        caste: user.caste || 'General',
        disabilityStatus: user.disabilityStatus ? 'Yes' : 'No',
        bplStatus: user.bplStatus ? 'Yes' : 'No'
      });
    }
  }, [user, reset, isOpen]);

  const onSubmitForm = (data) => {
    setFormError(null);

    let parsedAge = null;
    if (data.age !== '' && data.age !== null && data.age !== undefined) {
      const ageNum = Number(data.age);
      if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
        setFormError('Age must be a valid whole number between 1 and 120.');
        return;
      }
      parsedAge = ageNum;
    }

    let parsedIncome = Number(data.annualIncome);
    if (isNaN(parsedIncome) || parsedIncome < 0) {
      setFormError('Annual income cannot be negative.');
      return;
    }

    const formattedData = {
      name: data.name?.trim(),
      email: data.email?.trim()?.toLowerCase(),
      phone: data.phone?.trim() || '',
      role: data.role || 'user',
      age: parsedAge,
      gender: data.gender,
      state: data.state,
      city: data.city?.trim() || '',
      occupation: data.occupation,
      education: data.education,
      annualIncome: parsedIncome,
      caste: data.caste,
      disabilityStatus: data.disabilityStatus === 'Yes',
      bplStatus: data.bplStatus === 'Yes'
    };

    onSave(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User Profile"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}

        {/* Basic Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              {...register('name', { required: true })}
              placeholder="Citizen full name"
              className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              {...register('email', { required: true })}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
          </div>
        </div>

        {/* Role & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              User Role *
            </label>
            <select
              {...register('role')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              <option value="user">Citizen (User)</option>
              <option value="admin">Administrator (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
          </div>
        </div>

        {/* Demographics: Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              {...register('age')}
              placeholder="e.g. 28"
              className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gender
            </label>
            <select
              {...register('gender')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Annual Income (₹)
            </label>
            <input
              type="number"
              min={0}
              step={5000}
              {...register('annualIncome')}
              placeholder="e.g. 250000"
              className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
          </div>
        </div>

        {/* Location: State & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Union Territory
            </label>
            <select
              {...register('state')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City / District
            </label>
            {availableCities.length > 0 ? (
              <select
                {...register('city')}
                className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
              >
                <option value="">Select City</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                {...register('city')}
                placeholder="Enter city"
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0f2942] outline-none"
              />
            )}
          </div>
        </div>

        {/* Occupation, Education & Caste */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Occupation
            </label>
            <select
              {...register('occupation')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              {OCCUPATIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Education Level
            </label>
            <select
              {...register('education')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              {EDUCATION_LEVELS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Caste / Category
            </label>
            <select
              {...register('caste')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              {CASTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Disability & BPL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Disability Status (PwD)
            </label>
            <select
              {...register('disabilityStatus')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              <option value="No">No</option>
              <option value="Yes">Yes (Person with Disability)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              BPL Ration Card Holder
            </label>
            <select
              {...register('bplStatus')}
              className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              <option value="No">No</option>
              <option value="Yes">Yes (Below Poverty Line)</option>
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#163857] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save User Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
