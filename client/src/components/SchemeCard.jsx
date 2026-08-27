import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MatchBadge } from './Badge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userService } from '../services/userService';
import { 
  Building2, 
  Bookmark,
  Eye
} from 'lucide-react';

const CATEGORY_META = {
  'Agriculture & Farmers': { emoji: '🌾', label: 'Agriculture', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Healthcare & Health Insurance': { emoji: '🏥', label: 'Healthcare', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  'Education & Scholarships': { emoji: '🎓', label: 'Education', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Financial Inclusion & Business': { emoji: '💰', label: 'Finance', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Housing & Rural Development': { emoji: '🏠', label: 'Housing', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  'Women & Child Welfare': { emoji: '👶', label: 'Women & Child', bg: 'bg-pink-50 text-pink-700 border-pink-200' },
  'Social Security & Pensions': { emoji: '🛡️', label: 'Social Security', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'Employment & Skill Development': { emoji: '💼', label: 'Employment', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
};

export const SchemeCard = ({ scheme, matchResult, showEligibilityDetails = false, index = 0, isInitiallySaved = false }) => {
  const { citizenUser, isCitizenAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();
  const [saved, setSaved] = useState(isInitiallySaved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (citizenUser?.savedSchemes && Array.isArray(citizenUser.savedSchemes)) {
      const isSaved = citizenUser.savedSchemes.some((item) => {
        const id = item.scheme?._id || item.scheme || item;
        return id?.toString() === scheme._id?.toString();
      });
      setSaved(isSaved);
    }
  }, [citizenUser, scheme._id]);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isCitizenAuthenticated) {
      notifyWarning('Please sign in as a citizen to bookmark schemes to Your Schemes.');
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      if (saved) {
        await userService.removeSavedScheme(scheme._id);
        setSaved(false);
        notifySuccess(`"${scheme.title}" removed from Your Schemes`);
      } else {
        await userService.saveScheme(scheme._id);
        setSaved(true);
        notifySuccess(`"${scheme.title}" saved to Your Schemes!`);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      notifyError('Failed to update bookmark. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Category Metadata
  const catMeta = CATEGORY_META[scheme.category] || { 
    emoji: '🏛️', 
    label: scheme.category || 'Welfare', 
    bg: 'bg-slate-100 text-slate-700 border-slate-200' 
  };

  // Stagger animation style calculation
  const animationDelayStyle = { animationDelay: `${(index % 6) * 100}ms` };

  return (
    <div 
      style={animationDelayStyle}
      className="scheme-card-container animate-card-enter h-full flex flex-col justify-between relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[24px] p-7 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] hover:-translate-y-[6px] hover:border-[#D1D5DB] transition-all duration-300 ease-out"
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        
        {/* Row 1: Category Badge & Bookmark Icon */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <span className={`px-4 py-2 inline-flex items-center gap-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${catMeta.bg}`}>
            <span className="text-sm">{catMeta.emoji}</span>
            <span>{catMeta.label}</span>
          </span>

          <div className="flex items-center gap-2">
            {matchResult && (
              <MatchBadge percentage={matchResult.matchPercentage} isEligible={matchResult.isEligible} />
            )}

            {/* Bookmark Icon */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={saving}
              title={saved ? 'Remove from Your Schemes' : 'Save to Your Schemes'}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                saved 
                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs' 
                  : 'border-[#E5E7EB] text-slate-400 hover:text-amber-600 hover:bg-amber-50/80 hover:border-amber-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 transition-transform duration-200 ${saved ? 'fill-amber-500 text-amber-600 scale-110' : ''}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Scheme Title (Max 3 Lines, Poppins 25px Bold) */}
        <Link 
          to={`/schemes/${scheme._id}`} 
          title={scheme.title}
          className="block mb-3 hover:text-emerald-800 transition-colors"
        >
          <h3 className="text-[22px] sm:text-[25px] font-bold text-[#0F172A] leading-[1.3] tracking-tight line-clamp-3">
            {scheme.title}
          </h3>
        </Link>

        {/* Row 3: Ministry Name */}
        <div className="flex items-start gap-2 text-[14px] font-medium text-slate-500 mb-6">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{scheme.department}</span>
        </div>

        {/* Row 4: Short Description (Max 2 Lines) */}
        <p className="text-[15px] text-slate-600 line-clamp-2 leading-relaxed mb-6">
          {scheme.shortDescription}
        </p>

        {/* Discrepancy Warnings (Only on eligibility checking mode) */}
        {showEligibilityDetails && matchResult && !matchResult.isEligible && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <span className="font-bold block">Discrepancy Reasons:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {matchResult.reasonsNotEligible.slice(0, 2).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Row 5: Soft Divider */}
      <div className="border-t border-[#E5E7EB] my-5"></div>

      {/* Row 6: Two Action Buttons (Slimmer Height: 44px, 14px Radius, Perfect Center Alignment) */}
      <div className="mt-auto flex items-center justify-between gap-3">
        {/* Left Button: View Details */}
        <Link
          to={`/schemes/${scheme._id}`}
          className="btn-saas-action flex-1"
        >
          <Eye className="w-4 h-4 text-slate-700 shrink-0 stroke-[2.2]" />
          <span>View Details</span>
        </Link>
        {/* Right Button: Apply Now → */}
        {scheme.officialWebsiteUrl ? (
          <a
            href={scheme.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-saas-action flex-1"
          >
            <span>Apply Now</span>
            <span className="btn-arrow-icon">→</span>
          </a>
        ) : (
          <Link
            to={`/schemes/${scheme._id}`}
            className="btn-saas-action flex-1"
          >
            <span>Apply Now</span>
            <span className="btn-arrow-icon">→</span>
          </Link>
        )}
      </div>
    </div>
  );
};
