import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eligibilityService } from '../services/eligibilityService';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/SchemeCard';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Edit3,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Filter,
  MapPin,
  Briefcase,
  IndianRupee,
  Compass
} from 'lucide-react';
import { SCHEME_CATEGORIES } from '../utils/constants';

export const DashboardPage = () => {
  const { user, cachedEligibility, isProfileComplete, runBackgroundEligibilityCheck } = useAuth();
  
  const [allSchemes, setAllSchemes] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls for Explore Section
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Single source of truth for category options
  const categoryOptions = useMemo(() => {
    const cleanList = SCHEME_CATEGORIES.filter((c) => c && c.trim().toLowerCase() !== 'all');
    return ['All', ...Array.from(new Set(cleanList))];
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all schemes for the Explore section
        const schemesRes = await schemeService.getSchemes({ limit: 100 });
        if (schemesRes.success && schemesRes.schemes) {
          setAllSchemes(schemesRes.schemes);
        }

        // Fetch popular & recently added
        const recRes = await eligibilityService.getRecommendations();
        if (recRes.success) {
          setPopular(recRes.popular || []);
          setRecentlyAdded(recRes.recentlyAdded || []);
        }

        // Auto-run background eligibility check if profile complete but no cache
        if (isProfileComplete && (!cachedEligibility || cachedEligibility.eligibleCount === undefined)) {
          await runBackgroundEligibilityCheck(user);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isProfileComplete]);

  // Extract raw eligible items and sort by highest eligibility score first (100% -> 95% -> 90%)
  const eligibleItems = useMemo(() => {
    if (!isProfileComplete || !cachedEligibility?.eligibleSchemes) return [];
    
    const list = [...cachedEligibility.eligibleSchemes];
    return list.sort((a, b) => {
      const scoreA = a.matchPercentage ?? 100;
      const scoreB = b.matchPercentage ?? 100;
      return scoreB - scoreA;
    });
  }, [isProfileComplete, cachedEligibility]);

  // Set of IDs of eligible schemes to exclude from the Browse / Explore section
  const eligibleSchemeIds = useMemo(() => {
    const ids = new Set();
    eligibleItems.forEach((item) => {
      const id = item.scheme?._id || item._id || item.schemeId;
      if (id) ids.add(id);
    });
    return ids;
  }, [eligibleItems]);

  // Filter & Sort remaining schemes for "Explore More Government Schemes"
  const filteredRemainingSchemes = useMemo(() => {
    // 1. Exclude already displayed eligible schemes to avoid duplicates
    let list = allSchemes.filter((s) => !eligibleSchemeIds.has(s._id));

    // 2. Search query filter
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

    // 3. Category filter
    if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
      list = list.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 4. Sort
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
  }, [allSchemes, eligibleSchemeIds, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. PREMIUM GOVERNMENT SAAS DASHBOARD HERO SECTION */}
      <div className="bg-gradient-to-r from-[#0c2338] via-[#0f2942] to-[#143252] rounded-[28px] p-6 sm:p-8 text-white shadow-xl shadow-[#0f2942]/10 border border-slate-700/50 backdrop-blur-md space-y-6">
        {/* Top Header & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Your personalized Government Scheme Dashboard
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isProfileComplete && eligibleItems.length > 0 ? (
              <a
                href="#my-eligible-schemes"
                className="px-5 py-2.5 bg-[#e07a10] hover:bg-[#c96a0b] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>View My Eligible Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to="/profile"
                className="px-5 py-2.5 bg-[#e07a10] hover:bg-[#c96a0b] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Complete Profile to Unlock Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#e07a10]" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* User Info Inline Chips */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-[#e07a10]" />
            <span>State: <strong className="text-white">{user?.state || 'Not Specified'}</strong></span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Occupation: <strong className="text-white">{user?.occupation || 'Not Specified'}</strong></span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>Annual Income: <strong className="text-emerald-400">₹{(user?.annualIncome || 0).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/50 w-full"></div>

        {/* Compact Eligibility Summary Card */}
        {isProfileComplete ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  🎯 Eligible Schemes
                </span>
                <span className="text-lg font-extrabold text-white">
                  {eligibleItems.length} Schemes Matched
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Status: Verified & Active</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-200">Profile Incomplete</p>
              <p className="text-slate-300">Complete your demographic profile to unlock automatic eligibility evaluation.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. MY ELIGIBLE SCHEMES (FIRST SECTION AFTER WELCOME BANNER) */}
      {eligibleItems.length > 0 && (
        <section id="my-eligible-schemes" className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>My Eligible Schemes</span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                {eligibleItems.length} Matched
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Schemes calculated specifically for your verified demographic profile and location
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-60 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleItems.map((item, idx) => {
                const schemeObj = item.scheme || item;
                return (
                  <SchemeCard 
                    key={schemeObj._id || idx} 
                    scheme={schemeObj} 
                    matchResult={item}
                    index={idx} 
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 3. FILTERS & EXPLORE MORE GOVERNMENT SCHEMES */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        {/* Filter & Controls Bar */}
        <div className="space-y-4">
          <div className="surface-card p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search remaining schemes..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0f2942] outline-none cursor-pointer"
              >
                <option value="Newest">Newest</option>
                <option value="Most Popular">Most Popular</option>
                <option value="Central">Central Schemes</option>
                <option value="State">State Schemes</option>
                <option value="Category">Category</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categoryOptions.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2942] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Heading: Explore More Government Schemes */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-[#0f2942]" />
            <span>Explore More Government Schemes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse all remaining central and state government initiatives available across India
          </p>
        </div>

        {/* Remaining Schemes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredRemainingSchemes.length === 0 ? (
          <div className="surface-card p-10 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Additional Schemes Found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try clearing your search query or selecting a different category filter.' 
                : 'All available schemes are currently matching your eligible profile!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRemainingSchemes.map((scheme, idx) => (
              <SchemeCard key={scheme._id || idx} scheme={scheme} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR & RECENTLY ADDED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Popular Schemes */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
            <TrendingUp className="w-5 h-5 text-[#0f2942]" />
            Most Viewed & Popular Schemes
          </h2>
          <div className="space-y-4">
            {popular.slice(0, 3).map((scheme) => (
              <div key={scheme._id} className="surface-card p-4 rounded-2xl bg-white flex items-center justify-between gap-4 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{scheme.title}</h4>
                  <span className="text-xs text-slate-500">{scheme.department}</span>
                </div>
                <Link to={`/schemes/${scheme._id}`} className="text-xs font-bold text-[#0f2942] hover:underline shrink-0">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
            <Clock className="w-5 h-5 text-emerald-600" />
            Recently Published Initiatives
          </h2>
          <div className="space-y-4">
            {recentlyAdded.slice(0, 3).map((scheme) => (
              <div key={scheme._id} className="surface-card p-4 rounded-2xl bg-white flex items-center justify-between gap-4 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{scheme.title}</h4>
                  <span className="text-xs text-slate-500">{scheme.category}</span>
                </div>
                <Link to={`/schemes/${scheme._id}`} className="text-xs font-bold text-[#0f2942] hover:underline shrink-0">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
