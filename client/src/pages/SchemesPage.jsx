import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/SchemeCard';
import { Pagination } from '../components/Pagination';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { SCHEME_CATEGORIES, INDIAN_STATES } from '../utils/constants';
import { PageMotionWrapper } from '../components/PageMotionWrapper';

export const SchemesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [stateFilter, setStateFilter] = useState('All');
  const [occupation, setOccupation] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);

  // Update category when URL query param changes
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setCategory(catFromUrl);
    } else {
      setCategory('All');
    }
  }, [searchParams]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await schemeService.getSchemes({
        page,
        limit: 9,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        state: stateFilter !== 'All' ? stateFilter : undefined,
        occupation: occupation !== 'All' ? occupation : undefined
      });

      if (res.success) {
        setSchemes(res.schemes);
        setTotalPages(res.pages);
        setTotalSchemes(res.total);
      }
    } catch (error) {
      console.error('Failed to load schemes catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [page, category, stateFilter, occupation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchemes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStateFilter('All');
    setOccupation('All');
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

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, benefit or ministry..."
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
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
          <div className="md:col-span-3">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none"
            >
              <option value="All">State: All India</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong className="text-slate-900">{schemes.length}</strong> of <strong className="text-slate-900">{totalSchemes}</strong> Schemes</span>
          {category !== 'All' && (
            <span className="bg-blue-50 text-[#0f2942] px-2.5 py-0.5 rounded-full font-semibold">
              Filter: {category}
            </span>
          )}
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
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No schemes found matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the selected category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#0f2942] text-white text-xs font-bold rounded-xl mt-2 cursor-pointer"
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
