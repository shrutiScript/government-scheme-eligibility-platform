import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import { eligibilityService } from '../services/eligibilityService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Badge, MatchBadge } from '../components/Badge';
import {
  Building2,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  PhoneCall,
  Calendar,
  Tag,
  IndianRupee,
  MapPin,
  Briefcase,
  Layers,
  HelpCircle,
  Info
} from 'lucide-react';

const TargetBeneficiariesCard = ({ beneficiaries }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = beneficiaries && beneficiaries.length > 80;

  return (
    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3 transition-all duration-200">
      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
        <Users className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-0.5">
          Target Beneficiaries
        </span>
        <p className={`text-xs font-extrabold text-blue-900 leading-snug break-words ${expanded ? '' : 'line-clamp-3'}`}>
          {beneficiaries}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 hover:underline mt-1 inline-block cursor-pointer transition-colors"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
    </div>
  );
};

export const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { notifyWarning } = useNotification();

  const [scheme, setScheme] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fresh API call to fetch full scheme details directly from MongoDB using scheme ID
        const res = await schemeService.getSchemeById(id);
        if (res.success && res.scheme) {
          setScheme(res.scheme);
        } else {
          setError('Scheme not found');
        }
      } catch (err) {
        console.error('Failed to fetch scheme details:', err);
        setError(err.message || 'Scheme not found');
      } finally {
        setLoading(false);
      }
    };

    if (!id || id.toLowerCase() === 'all') {
      navigate('/schemes', { replace: true });
      return;
    }

    if (id) {
      fetchSchemeDetails();
    } else {
      setLoading(false);
      setError('Invalid Scheme ID');
    }
  }, [id, navigate]);

  const runEligibilityCheck = useCallback(async () => {
    setEvaluating(true);
    try {
      const res = await eligibilityService.checkEligibility(user || {});
      if (res.success && res.eligibleSchemes) {
        const found = [...res.eligibleSchemes, ...res.notEligibleSchemes].find(
          (item) => item.scheme?._id === id || item.schemeId === id
        );
        if (found) {
          setMatchResult(found);
        }
      }
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  }, [id, user]);

  // Auto-run evaluation if returned from login with autoCheck flag
  useEffect(() => {
    if (user && location.state?.autoCheck && scheme && !matchResult) {
      runEligibilityCheck();
    }
  }, [user, location.state, scheme, matchResult, runEligibilityCheck]);

  const handleEvaluateEligibility = () => {
    // 1. Unauthenticated protection check
    if (!user) {
      // Show professional warning toast notification immediately
      notifyWarning({
        title: 'Login Required',
        message: 'Please sign in to check your eligibility for government schemes.'
      });

      // After a short delay (1000ms), display loading screen overlay
      setTimeout(() => {
        setIsRedirecting(true);

        // After loading animation completes (2.5 seconds), redirect to Sign In page
        setTimeout(() => {
          navigate('/login', {
            state: {
              from: `/schemes/${id}`,
              autoCheck: true
            }
          });
        }, 2500);
      }, 1000);

      return;
    }

    // 2. Already logged in -> start evaluation immediately
    runEligibilityCheck();
  };

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Clean "Scheme Not Found" Page
  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scheme Not Found</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The scheme you are looking for does not exist, may have been removed, or the link is invalid.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Schemes Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const criteria = scheme.eligibilityCriteria || {};
  const benefitsList = Array.isArray(scheme.benefits)
    ? scheme.benefits
    : scheme.benefits
      ? [scheme.benefits]
      : [];

  const docsList = scheme.documentsRequired || scheme.requiredDocuments || [];
  const tagsList = scheme.tags || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* PREMIUM FULL-SCREEN REDIRECT LOADING OVERLAY */}
      {isRedirecting && (
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
                Redirecting to Sign In...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Please log in to continue and check your eligibility.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0f2942] via-[#e07a10] to-emerald-600 animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Back Link */}
      <div>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0f2942] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Schemes</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="surface-card p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6 relative overflow-hidden">
        {/* Badges & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary">{scheme.category}</Badge>
            <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              {scheme.state || 'All India'}
            </span>
            {scheme.status && (
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${scheme.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                ● {scheme.status}
              </span>
            )}
            {(scheme.lastDate || scheme.applicationLastDate) && new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) && (
              <span className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" /> Application Deadline Expired
              </span>
            )}
          </div>

          {matchResult && (
            <MatchBadge percentage={matchResult.matchPercentage} isEligible={matchResult.isEligible} />
          )}
        </div>

        {/* Title & Department */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {scheme.title}
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
            <Building2 className="w-4 h-4 text-[#0f2942] shrink-0" />
            <span>{scheme.department}</span>
          </div>
        </div>

        {/* Overview Description */}
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          {scheme.description || scheme.shortDescription}
        </p>

        {/* Key Info Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 items-start">
          {scheme.benefitAmount && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">Benefit Amount</span>
                <span className="text-xs font-extrabold text-emerald-900 leading-snug block">{scheme.benefitAmount}</span>
              </div>
            </div>
          )}

          {scheme.beneficiaries && (
            <TargetBeneficiariesCard beneficiaries={scheme.beneficiaries} />
          )}

          {scheme.launchDate && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Launch Date</span>
                <span className="text-xs font-extrabold text-amber-900 leading-snug block">{scheme.launchDate}</span>
              </div>
            </div>
          )}

          {(scheme.lastDate || scheme.applicationLastDate) && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? 'bg-rose-50/80 border-rose-200/80' : 'bg-blue-50/80 border-blue-200/80'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-800'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? 'text-rose-800' : 'text-blue-800'}`}>
                  Last Date
                </span>
                <span className={`text-xs font-extrabold leading-snug block ${new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? 'text-rose-900' : 'text-blue-900'}`}>
                  {scheme.lastDate || scheme.applicationLastDate} {new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? '(Expired)' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleEvaluateEligibility}
            disabled={evaluating || isRedirecting}
            className="px-6 py-3 bg-[#e07a10] hover:bg-[#c96a0b] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            {evaluating ? 'Evaluating...' : 'Check My Eligibility'}
          </button>

          {scheme.officialWebsiteUrl && (
            <a
              href={scheme.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#0f2942] hover:bg-[#0c2338] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Match Result Banner (if evaluated) */}
      {matchResult && !matchResult.isEligible && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            Eligibility Assessment ({matchResult.matchPercentage}% Match)
          </h3>
          <p className="text-xs text-rose-800">
            Your profile currently does not satisfy the following mandatory eligibility requirements:
          </p>
          <ul className="list-disc pl-5 text-xs text-rose-800 space-y-1 pt-1 font-semibold">
            {matchResult.reasonsNotEligible.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Benefits, Application Process, Required Documents & Helpline */}
        <div className="lg:col-span-2 space-y-8">

          {/* Key Benefits */}
          <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Key Benefits & Entitlements
            </h2>
            {benefitsList.length > 0 ? (
              <ul className="space-y-3">
                {benefitsList.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Direct financial and social security benefits as per central guidelines.</p>
            )}
          </div>

          {/* Application Process */}
          <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <FileText className="w-5 h-5 text-[#0f2942]" />
              Application Process & How to Apply
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {scheme.applicationProcess || 'Submit form through the official government portal or visit your local District Nodal Office / CSC.'}
            </p>
          </div>

          {/* Required Documents */}
          <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Mandatory Required Documents
            </h2>
            {docsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docsList.map((doc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard identity and residence proof required.</p>
            )}
          </div>

          {/* Helpline & Contact Info */}
          {scheme.helpline && (
            <div className="surface-card p-6 sm:p-8 rounded-3xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <h2 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-700" />
                Helpline & Contact Information
              </h2>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {scheme.helpline}
              </p>
            </div>
          )}

          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <Tag className="w-4 h-4 text-slate-400" />
              {tagsList.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Eligibility Criteria Matrix */}
        <aside className="space-y-6">
          <div className="surface-card rounded-3xl bg-white border border-slate-200/90 shadow-md overflow-hidden transition-all">
            {/* Header with Dark Navy Background */}
            <div className="p-5 bg-[#0f2942] text-white space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 text-amber-400">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      ELIGIBILITY MATRIX
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Scheme Requirements
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold tracking-wide">
                  Verified
                </span>
              </div>
            </div>

            {/* Matrix Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Age Limit */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Age Limit</span>
                </div>
                <span className="font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                  {criteria.noAgeLimit || (criteria.minAge === null && criteria.maxAge === null)
                    ? 'No Age Limit'
                    : `${criteria.minAge ?? 1} – ${criteria.maxAge ?? 120} Years`}
                </span>
              </div>

              {/* Max Annual Income */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Max Annual Income</span>
                </div>
                <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl text-xs">
                  {criteria.noIncomeLimit || criteria.maxIncome === null || criteria.maxAnnualIncome === null
                    ? 'No Income Limit'
                    : `₹${(criteria.maxIncome ?? criteria.maxAnnualIncome ?? 0).toLocaleString('en-IN')} / Yr`}
                </span>
              </div>

              {/* Target Gender */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Target Gender</span>
                </div>
                <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                  {criteria.gender || 'All'}
                </span>
              </div>

              {/* Target State */}
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Target State(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {Array.isArray(criteria.allowedStates) && criteria.allowedStates.length > 0 ? (
                    criteria.allowedStates.map((st, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 text-[11px] font-bold">
                        {st}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 text-[11px] font-bold">
                      {scheme.state || 'All'}
                    </span>
                  )}
                </div>
              </div>

              {/* Occupations */}
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Target Occupations</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {Array.isArray(criteria.allowedOccupations) && criteria.allowedOccupations.length > 0 ? (
                    criteria.allowedOccupations.map((occ, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/70 text-xs font-bold">
                        {occ}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
                      All Occupations
                    </span>
                  )}
                </div>
              </div>

              {/* Castes / Social Category */}
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Eligible Social Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {Array.isArray(criteria.allowedCastes) && criteria.allowedCastes.length > 0 ? (
                    criteria.allowedCastes.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-100 text-[11px] font-bold">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
                      All Categories
                    </span>
                  )}
                </div>
              </div>

              {/* PwD & BPL Requirements */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    DISABILITY (PWD)
                  </span>
                  <span className={`text-xs font-black block ${criteria.disabilityRequired ? 'text-amber-700' : 'text-slate-800'}`}>
                    {criteria.disabilityRequired ? 'Required' : 'Not Required'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    BPL CARD
                  </span>
                  <span className={`text-xs font-black block ${criteria.bplRequired ? 'text-amber-700' : 'text-slate-800'}`}>
                    {criteria.bplRequired ? 'Required' : 'Not Required'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Official Government Criteria Active</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
