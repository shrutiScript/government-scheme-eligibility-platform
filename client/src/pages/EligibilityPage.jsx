import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SchemeCard } from '../components/SchemeCard';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Layers,
  Building2,
  Globe2
} from 'lucide-react';
import { SCHEME_CATEGORIES } from '../utils/constants';

export const EligibilityPage = () => {
  const { user, cachedEligibility, isProfileComplete, runBackgroundEligibilityCheck } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [loading, setLoading] = useState(false);

  const userId = user?._id || user?.id;

  // Auto-run background evaluation if user is complete but no cache exists
  useEffect(() => {
    if (isProfileComplete && (!cachedEligibility || !cachedEligibility.eligibleSchemes || cachedEligibility.eligibleSchemes.length === 0)) {
      if (user) {
        setLoading(true);
        runBackgroundEligibilityCheck(user).finally(() => setLoading(false));
      }
    }
  }, [userId, isProfileComplete]);

  const rawEligibleSchemes = cachedEligibility?.eligibleSchemes || [];

  // Filter & Sort Logic
  const filteredAndSortedSchemes = useMemo(() => {
    let list = rawEligibleSchemes.map((item) => item.scheme || item);

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'Most Popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === 'Central') {
        const isACentral = a.state === 'Central' || a.state === 'All India' || !a.state;
        const isBCentral = b.state === 'Central' || b.state === 'All India' || !b.state;
        return isBCentral - isACentral;
      }
      if (sortBy === 'State') {
        const isAState = a.state && a.state !== 'Central' && a.state !== 'All India';
        const isBState = b.state && b.state !== 'Central' && b.state !== 'All India';
        return isBState - isAState;
      }
      if (sortBy === 'Category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });

    return list;
  }, [rawEligibleSchemes, searchQuery, selectedCategory, sortBy]);

  return (
    <PageMotionWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-[#0f2942] rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-4 border border-slate-700/60 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e07a10]/20 text-[#e07a10] border border-[#e07a10]/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#e07a10]" />
            <span>Personalized Eligibility Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            🎯 Eligible Government Schemes
          </h1>
          <p className="text-sm text-slate-300">
            {isProfileComplete ? (
              <>
                <span className="text-[#e07a10] font-extrabold text-base mr-1">{rawEligibleSchemes.length} Schemes Found</span> 
                based on your profile criteria ({user?.state}, {user?.occupation}, ₹{(user?.annualIncome || 0).toLocaleString('en-IN')})
              </>
            ) : (
              'Complete your profile to unlock custom scheme evaluation.'
            )}
          </p>
        </div>

        {isProfileComplete && (
          <Link
            to="/profile"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all shrink-0"
          >
            Update Demographic Profile
          </Link>
        )}
      </div>

      {/* PROFILE INCOMPLETE GUARD */}
      {!isProfileComplete ? (
        <div className="surface-card p-12 text-center rounded-3xl bg-white border border-amber-200 shadow-md space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Complete your profile to discover Government Schemes.
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We match your exact age, income, state, education and caste against official government guidelines. Please fill in your profile details first.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* SEARCH, SORT & FILTER CONTROLS */
        <div className="space-y-6">
          <div className="surface-card p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, ministry, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0f2942] outline-none cursor-pointer"
              >
                <option value="Newest">Newest</option>
                <option value="Most Popular">Most Popular</option>
                <option value="Central">Central Schemes</option>
                <option value="State">State Schemes</option>
                <option value="Category">Category</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', ...SCHEME_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0f2942] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID OF ELIGIBLE SCHEMES */}
          {loading && filteredAndSortedSchemes.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredAndSortedSchemes.length === 0 ? (
            <div className="surface-card p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Schemes Matched Criteria</h3>
              <p className="text-xs text-slate-500">
                Try clearing your search query or selecting a different category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSchemes.map((scheme, idx) => (
                <SchemeCard key={scheme._id || idx} scheme={scheme} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageMotionWrapper>
  );
};
