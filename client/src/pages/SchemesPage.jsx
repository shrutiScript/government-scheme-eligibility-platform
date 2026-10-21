import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/SchemeCard';
import { Pagination } from '../components/Pagination';
import { Search, Filter, RefreshCw, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { SCHEME_CATEGORIES, INDIAN_STATES } from '../utils/constants';
import { PageMotionWrapper } from '../components/PageMotionWrapper';

export const SchemesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [stateFilter, setStateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);

  // Update category when URL query param changes
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setCategory(catFromUrl);
    }
  }, [searchParams]);

  const fetchSchemes = useCallback(async (targetPage = page, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await schemeService.getSchemes({
        page: targetPage,
        limit: 9,
        search: searchTerm.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        state: stateFilter !== 'All' ? stateFilter : undefined,
        sortBy: sortBy || 'newest'
      });

      if (res.success) {
        setSchemes(res.schemes || []);
        setTotalPages(res.pages || 1);
        setTotalSchemes(res.total || 0);
      }
    } catch (error) {
      console.error('Failed to load schemes catalog:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, stateFilter, sortBy]);

  // Debounce search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchemes(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, category, stateFilter, sortBy, fetchSchemes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchemes(1, search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStateFilter('All');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <PageMotionWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Government Schemes Directory
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Browse central and state government welfare schemes available across India
        </p>
      </div>

      {/* Filter & Sorting Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search scheme name, ministry, keyword..."
              className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                setPage(1);
                if (newCat !== 'All') {
                  setSearchParams({ category: newCat });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {SCHEME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="lg:col-span-2">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none cursor-pointer"
            >
              <option value="All">State: All India</option>
              {INDIAN_STATES.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none cursor-pointer font-medium text-slate-800"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Scheme Name (A → Z)</option>
              <option value="name_desc">Scheme Name (Z → A)</option>
              <option value="income_asc">Income (Low → High)</option>
              <option value="income_desc">Income (High → Low)</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full p-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer flex items-center justify-center transition-colors"
              title="Reset All Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Results Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{schemes.length}</strong> of{' '}
            <strong className="text-slate-900">{totalSchemes}</strong> Active Schemes
          </span>
          <div className="flex items-center gap-2">
            {category !== 'All' && (
              <span className="bg-blue-50 text-[#0f2942] px-2.5 py-0.5 rounded-full font-semibold">
                Category: {category}
              </span>
            )}
            {stateFilter !== 'All' && (
              <span className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
                State: {stateFilter}
              </span>
            )}
            {search && (
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                Search: "{search}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-[20px] animate-pulse"></div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching schemes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active government schemes match your current search and filter criteria. Try adjusting keywords or clearing filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-bold rounded-xl mt-2 cursor-pointer transition-all shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme, idx) => (
            <SchemeCard key={scheme._id} scheme={scheme} index={idx} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pt-4">
          <Pagination page={page} pages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </PageMotionWrapper>
  );
};
