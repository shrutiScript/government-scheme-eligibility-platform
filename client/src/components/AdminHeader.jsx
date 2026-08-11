import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, X } from 'lucide-react';

export const AdminHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-6 gap-4 shrink-0">

      {/* Left — Logo */}
      <Link to="/" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-8 h-8 flex items-center justify-center text-[#0f2942] shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
            <path d="M12 2L4 7v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5z" fill="#f0f7ff" />
            <circle cx="12" cy="12" r="4" stroke="#0052cc" strokeWidth="1.5" />
            <path d="M12 8v8M8 12h8" stroke="#ff9933" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-lg font-black text-[#0f2942] tracking-tight leading-none group-hover:text-[#0052cc] transition-colors">
            SchemeSetu
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-tight mt-0.5 hidden sm:block">
            Connecting Citizens to Government Schemes
          </span>
        </div>
      </Link>

      {/* Search Bar — left-aligned, right after logo */}
      <form
        onSubmit={handleSearchSubmit}
        className="w-72 shrink-0"
      >
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-200 bg-slate-50 ${searchFocused
            ? 'border-blue-400 shadow-md shadow-blue-100 bg-white'
            : 'border-slate-200 hover:border-slate-300'
            }`}
        >
          <Search className={`w-4 h-4 shrink-0 transition-colors ${searchFocused ? 'text-[#0052cc]' : 'text-slate-400'}`} />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search schemes..."
            className="flex-1 text-sm text-slate-700 bg-transparent placeholder-slate-400 outline-none font-medium min-w-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Spacer — pushes profile to far right */}
      <div className="flex-1" />

      {/* Right — Admin info chip (no dropdown, Sign Out is in sidebar) */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[#0f2942] text-white text-xs font-black flex items-center justify-center shrink-0 ring-2 ring-amber-400/60">
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-800 max-w-[110px] truncate leading-tight">
            {user?.name || 'System Admin'}
          </span>
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Admin</span>
        </div>
      </div>
    </header>
  );
};
