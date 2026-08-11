import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Upload,
  Save,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import {
  INDIAN_STATES,
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
    gender: 'Male',
    state: 'Delhi',
    district: '',
    occupation: 'Other',
    education: 'Graduate',
    annualIncome: '',
    caste: 'General',
    disabilityStatus: false,
    bplStatus: false
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        age: user.age !== null && user.age !== undefined ? user.age : '',
        gender: user.gender || 'Male',
        state: user.state || 'Delhi',
        district: user.district || '',
        occupation: user.occupation || 'Other',
        education: user.education || 'Graduate',
        annualIncome: user.annualIncome !== null && user.annualIncome !== undefined ? user.annualIncome : '',
        caste: user.caste || 'General',
        disabilityStatus: Boolean(user.disabilityStatus),
        bplStatus: Boolean(user.bplStatus)
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    const fields = [
      formData.name,
      formData.mobileNumber,
      formData.age,
      formData.gender,
      formData.state,
      formData.district,
      formData.occupation,
      formData.education,
      formData.annualIncome,
      formData.caste
    ];
    const filled = fields.filter((f) => f !== '' && f !== null && f !== undefined).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      handleUploadAvatar(file);
    }
  };

  const handleUploadAvatar = async (file) => {
    try {
      const data = new FormData();
      data.append('avatar', file);
      const res = await userService.uploadAvatar(data);
      if (res.success) {
        notifySuccess('Profile photo updated successfully!');
        if (res.user) updateUserState(res.user);
      }
    } catch (error) {
      notifyError(error.message || 'Avatar upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isEvaluating) return;

    if (!formData.name.trim()) {
      notifyError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      // 1. Save profile to backend
      const res = await userService.updateProfile(formData);
      if (res.success && res.user) {
        updateUserState(res.user);

        // 2. Automatically run background eligibility evaluation
        await runBackgroundEligibilityCheck(res.user);

        // 3. Show Green Success Toast: "Eligibility Evaluated Successfully"
        notifySuccess('Eligibility Evaluated Successfully');

        // 4. After 1.5s (as toast disappears), open loading modal and redirect
        setTimeout(() => {
          setIsEvaluating(true);
        }, 1200);

        // 5. Automatically redirect to Dashboard after modal informs user
        setTimeout(() => {
          navigate('/dashboard');
        }, 2800);
      }
    } catch (error) {
      notifyError(error.response?.data?.message || error.message || 'Failed to update profile');
      setIsEvaluating(false);
    } finally {
      setLoading(false);
    }
  };

  const completionPct = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* PREMIUM FULL-SCREEN REDIRECT LOADING OVERLAY */}
      {isEvaluating && (
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
                Redirecting to Dashboard...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Evaluating your profile criteria against government welfare schemes...
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
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0f2942] text-[#e07a10] font-extrabold text-3xl flex items-center justify-center border-4 border-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#e07a10] hover:bg-[#c96a0b] text-white flex items-center justify-center cursor-pointer shadow-md transition-transform group-hover:scale-105">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 font-medium">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200">
              Role: {user?.role}
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
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-8">
        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <User className="w-4 h-4 text-[#0f2942]" />
            1. Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Income (₹) *
              </label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder="e.g. 180000"
                required
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State of Residence *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {INDIAN_STATES.filter((s) => s !== 'All').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District name"
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Occupation *
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {OCCUPATIONS.filter((o) => o !== 'All').map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level *
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {EDUCATION_LEVELS.filter((e) => e !== 'All').map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Social Category / Caste *
              </label>
              <select
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                disabled={loading || isEvaluating}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                {CASTE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
                disabled={loading || isEvaluating}
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
                disabled={loading || isEvaluating}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="bplProfile" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Below Poverty Line (BPL Ration Card Holder)
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || isEvaluating}
            className="px-8 py-3.5 bg-[#e07a10] hover:bg-[#c96a0b] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading || isEvaluating ? (
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
