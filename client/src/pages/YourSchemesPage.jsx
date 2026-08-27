import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useNotification } from '../context/NotificationContext';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import {
  Bookmark,
  Building2,
  Calendar,
  Eye,
  Search,
  ExternalLink,
  Trash2,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  BookOpen
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

export const YourSchemesPage = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { notifySuccess, notifyError } = useNotification();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedSchemes = async () => {
    setLoading(true);
    try {
      const res = await userService.getSavedSchemes();
      if (res.success) {
        setSavedItems(res.savedSchemes || []);
      }
    } catch (err) {
      console.error('Failed to load saved schemes:', err);
      notifyError('Failed to load your saved schemes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSavedItems([]);
    fetchSavedSchemes();
  }, [userId]);

  // Handle removing a scheme from saved list
  const handleRemoveSaved = async (schemeId, schemeTitle) => {
    setRemovingId(schemeId);
    try {
      const res = await userService.removeSavedScheme(schemeId);
      if (res.success) {
        setSavedItems((prev) => prev.filter((item) => {
          const id = item.scheme?._id || item.scheme;
          return id !== schemeId;
        }));
        notifySuccess(`"${schemeTitle}" removed from Your Schemes`);
      }
    } catch (err) {
      console.error('Failed to remove saved scheme:', err);
      notifyError('Failed to remove scheme. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  // Extract unique categories from saved items for filter
  const availableCategories = useMemo(() => {
    const cats = new Set();
    savedItems.forEach((item) => {
      if (item.scheme?.category) cats.add(item.scheme.category);
    });
    return ['All', ...Array.from(cats)];
  }, [savedItems]);

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      const scheme = item.scheme;
      if (!scheme) return false;

      const matchesSearch =
        !searchQuery.trim() ||
        scheme.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || scheme.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [savedItems, searchQuery, selectedCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <PageMotionWrapper className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shadow-xs">
                <Bookmark className="w-6 h-6 fill-amber-500 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight">
                  Your Saved Schemes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Easily access and track government welfare programs you have bookmarked
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-4 py-2 rounded-2xl bg-blue-50 text-[#0052cc] text-xs font-black border border-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{savedItems.length} {savedItems.length === 1 ? 'Scheme' : 'Schemes'} Saved</span>
            </span>

            <button
              onClick={fetchSavedSchemes}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
              title="Refresh Saved Schemes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar (Only shown if user has saved schemes) */}
        {savedItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within your saved schemes..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all"
              />
            </div>

            {availableCategories.length > 2 && (
              <div className="w-full sm:w-64 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none font-medium text-slate-700 cursor-pointer transition-all"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content Area: Loading / Empty / List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-[24px] p-7 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
                  <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded-lg"></div>
                <div className="h-12 w-full bg-slate-100 rounded-lg"></div>
                <div className="h-10 w-full bg-slate-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-12 sm:p-16 text-center max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Bookmark className="w-10 h-10 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                You haven't saved any schemes yet.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Explore central and state government schemes and click the bookmark icon on any scheme to save it here for quick access and tracking.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0f2942] hover:bg-[#163857] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Browse Schemes Directory</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Filtered No-Results State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No matching saved schemes</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search terms or category filter.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-extrabold text-[#0052cc] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Schemes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const scheme = item.scheme;
              if (!scheme) return null;

              const catMeta = CATEGORY_META[scheme.category] || {
                emoji: '🏛️',
                label: scheme.category || 'Welfare',
                bg: 'bg-slate-100 text-slate-700 border-slate-200'
              };

              const savedDateText = formatDate(item.savedAt);
              const isRemoving = removingId === scheme._id;

              return (
                <div
                  key={scheme._id}
                  className="h-full flex flex-col justify-between relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[24px] p-7 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] hover:-translate-y-[4px] hover:border-[#D1D5DB] transition-all duration-300 group"
                >
                  <div className="flex flex-col flex-1">
                    {/* Category Badge & Remove Bookmark Action */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span className={`px-3.5 py-1.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold border ${catMeta.bg}`}>
                        <span className="text-sm">{catMeta.emoji}</span>
                        <span>{catMeta.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(scheme._id, scheme.title)}
                        disabled={isRemoving}
                        title="Remove from saved schemes"
                        className="w-9 h-9 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scheme Title (Clickable) */}
                    <Link
                      to={`/schemes/${scheme._id}`}
                      title={scheme.title}
                      className="block mb-2.5 group-hover:text-[#0052cc] transition-colors"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] leading-snug tracking-tight line-clamp-2">
                        {scheme.title}
                      </h3>
                    </Link>

                    {/* Department / Ministry */}
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-500 mb-4">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{scheme.department}</span>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {scheme.shortDescription || 'Comprehensive welfare benefits and financial assistance provided under this government scheme.'}
                    </p>
                  </div>

                  {/* Bottom Footer Section */}
                  <div className="mt-auto">
                    {/* Saved Date Info */}
                    {savedDateText && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saved on {savedDateText}</span>
                      </div>
                    )}

                    {/* Soft Divider */}
                    <div className="border-t border-[#E5E7EB] my-4"></div>

                    {/* Action Buttons (Browse Schemes layout, style, and animation) */}
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        to={`/schemes/${scheme._id}`}
                        className="btn-saas-action flex-1"
                      >
                        <Eye className="w-4 h-4 text-slate-700 shrink-0 stroke-[2.2]" />
                        <span>View Details</span>
                      </Link>

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
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageMotionWrapper>
  );
};

export default YourSchemesPage;
