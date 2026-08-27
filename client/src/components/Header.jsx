import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LayoutDashboard, User, Bookmark, LogOut } from 'lucide-react';

export const Header = () => {
  const {
    citizenUser,
    isCitizenAuthenticated,
    logoutCitizen
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutCitizen();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-40 bg-white border-b border-slate-200 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >

      <div className="w-full px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Ashoka Emblem SVG Motif */}
            <div className="w-8 h-8 flex items-center justify-center text-[#0f2942] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
                <path d="M12 2L4 7v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5z" fill="#f0f7ff" />
                <circle cx="12" cy="12" r="4" stroke="#0052cc" strokeWidth="1.5" />
                <path d="M12 8v8M8 12h8" stroke="#ff9933" strokeWidth="1.2" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black text-[#0f2942] tracking-tight leading-none group-hover:text-[#0052cc] transition-colors">
                SchemeSetu
              </span>
              <span className="text-[10px] font-bold text-slate-500 tracking-tight mt-0.5">
                Connecting Citizens to Government Schemes
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Motion Underline on Hover & Selected */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`relative py-1 text-sm tracking-wide transition-colors group ${isActive('/') ? 'text-[#0f2942] font-semibold' : 'text-slate-500 font-medium hover:text-[#0f2942]'
                }`}
            >
              <span>Home</span>
              <span
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${isActive('/') ? 'w-full bg-[#0f2942]' : 'w-0 bg-[#0f2942] group-hover:w-full'
                  }`}
              />
            </Link>

            <Link
              to="/schemes"
              className={`relative py-1 text-sm tracking-wide transition-colors group ${isActive('/schemes') ? 'text-[#0f2942] font-semibold' : 'text-slate-500 font-medium hover:text-[#0f2942]'
                }`}
            >
              <span>Browse Schemes</span>
              <span
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${isActive('/schemes') ? 'w-full bg-[#0f2942]' : 'w-0 bg-[#0f2942] group-hover:w-full'
                  }`}
              />
            </Link>

            {isCitizenAuthenticated && (
              <Link
                to="/dashboard"
                className={`relative py-1 text-sm tracking-wide transition-colors group ${isActive('/dashboard') ? 'text-[#0f2942] font-semibold' : 'text-slate-500 font-medium hover:text-[#0f2942]'
                  }`}
              >
                <span>Dashboard</span>
                <span
                  className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${isActive('/dashboard') ? 'w-full bg-[#0f2942]' : 'w-0 bg-[#0f2942] group-hover:w-full'
                    }`}
                />
              </Link>
            )}
          </nav>

          {/* Right Auth Links */}
          <div className="hidden md:flex items-center gap-7">
            {isCitizenAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0f2942] text-[#e07a10] text-xs font-black flex items-center justify-center border border-slate-300 select-none">
                    {citizenUser?.name ? citizenUser.name.trim().charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {citizenUser?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as Citizen</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{citizenUser?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/your-schemes"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      Your Schemes
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-7">
                <Link
                  to="/login"
                  className={`relative py-1 text-sm tracking-wide transition-colors group ${isActive('/login') ? 'text-[#0f2942] font-semibold' : 'text-slate-500 font-medium hover:text-[#0f2942]'
                    }`}
                >
                  <span>Sign In</span>
                  <span
                    className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${isActive('/login') ? 'w-full bg-[#0f2942]' : 'w-0 bg-[#0f2942] group-hover:w-full'
                      }`}
                  />
                </Link>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden rounded-3xl group focus:outline-none transition-transform active:scale-95 cursor-pointer shadow-md"
                >
                  {/* High Contrast Theme Radiant Beam Layer */}
                  <span className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#38bdf8_25%,#ffffff_50%,#ff9933_75%,transparent_100%)]" />

                  {/* Inner Button Fill & Text */}
                  <span className="relative inline-flex items-center justify-center px-4 py-1.5 rounded-3xl bg-[#0f2942] text-sm font-medium tracking-wide text-white group-hover:bg-[#163857] transition-colors">
                    Get Started
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0f2942]"
          >
            Home
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0f2942]"
          >
            Browse Schemes
          </Link>
          {isCitizenAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0f2942]"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0f2942]"
              >
                My Profile
              </Link>
              <Link
                to="/your-schemes"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0f2942]"
              >
                Your Schemes
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-[#0f2942]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
