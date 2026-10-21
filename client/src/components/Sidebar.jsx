import React from 'react';
import { LayoutDashboard, FileText, Users, Activity, User, LogOut, Shield, Plus } from 'lucide-react';

export const AdminSidebar = ({ activeTab, setActiveTab, onOpenAddSchemeModal, onLogout }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'schemes', label: 'Scheme Management', icon: FileText },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'logs', label: 'System Activity Logs', icon: Activity },
    { id: 'profile', label: 'Admin Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#081225] text-slate-300 min-h-screen p-5 flex flex-col justify-between shrink-0 border-r border-[#10203d]">
      <div className="space-y-6">
        {/* Admin Console Info Card */}
        <div className="bg-[#0f1d35] border border-[#1d3557]/40 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 fill-amber-500/25" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white text-sm font-bold tracking-tight">Admin Console</h2>
            <span className="text-[9px] font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Full Privileges
            </span>
          </div>
        </div>

        {/* Action Button: Add New Scheme */}
        <button
          onClick={onOpenAddSchemeModal}
          className="w-full bg-[#0052cc] hover:bg-[#0041a3] text-white rounded-xl py-3 px-4 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Scheme</span>
        </button>

        {/* Navigation Menu */}
        <div>
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3.5 block px-1">
            Navigation Menu
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                    isActive
                      ? 'bg-[#142d4c] text-white shadow-sm border-l-[3px] border-amber-500 pl-[11px]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-[#10203d] pt-4 space-y-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-950/20 transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
        <div className="px-3.5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
          v2.0.1 - Citizen-centric mode
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

