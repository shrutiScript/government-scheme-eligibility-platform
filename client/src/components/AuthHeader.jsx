import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * AuthHeader
 * Dedicated public header for Authentication pages (/login, /register).
 * Strictly unauthenticated — never renders client navigation, dashboard, or user dropdowns.
 */
export const AuthHeader = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
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

          {/* Public Auth Action Toggle */}
          <div className="flex items-center gap-4">
            {isLoginPage ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                  Don't have an account?
                </span>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden rounded-3xl group focus:outline-none transition-transform active:scale-95 cursor-pointer shadow-md"
                >
                  <span className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#38bdf8_25%,#ffffff_50%,#ff9933_75%,transparent_100%)]" />
                  <span className="relative inline-flex items-center justify-center px-4 py-1.5 rounded-3xl bg-[#0f2942] text-xs font-bold tracking-wide text-white group-hover:bg-[#163857] transition-colors">
                    Register
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                  Already registered?
                </span>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-3xl border border-slate-300 text-xs font-bold text-slate-700 hover:text-[#0f2942] hover:border-slate-400 bg-slate-50 hover:bg-white transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
