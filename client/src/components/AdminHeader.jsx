import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ChevronDown, LayoutDashboard, User, LogOut, FileText, Users, Activity } from 'lucide-react';

export const AdminHeader = ({ activeTab, setActiveTab }) => {
  const { adminUser, logoutAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleSelectTab = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs h-16 flex items-center justify-between px-6 shrink-0">
      {/* Left — Logo & Admin Console Badge */}
      <div className="flex items-center gap-4">
        <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
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
              Government Scheme Administration
            </span>
          </div>
        </Link>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

      </div>

      {/* Right — Admin Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-full bg-[#0f2942] text-amber-400 text-xs font-black flex items-center justify-center border border-slate-300 shrink-0 ring-1 ring-amber-400/40">
            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col text-left mr-1">
            <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate leading-tight">
              {adminUser?.name || 'Administrator'}
            </span>
            <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">
              Admin
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider">
                <Shield className="w-3 h-3 text-amber-600" />
                <span>Signed in as Administrator</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{adminUser?.email || 'admin@gmail.com'}</p>
            </div>

            <button
              onClick={() => handleSelectTab('overview')}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-[#0052cc]" />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectTab('schemes')}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Scheme Management</span>
            </button>

            <button
              onClick={() => handleSelectTab('users')}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>User Directory</span>
            </button>

            <button
              onClick={() => handleSelectTab('logs')}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Activity Logs</span>
            </button>

            <button
              onClick={() => handleSelectTab('profile')}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer border-t border-slate-100"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Admin Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
