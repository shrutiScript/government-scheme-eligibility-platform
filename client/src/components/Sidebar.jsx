import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  ShieldCheck,
  Activity,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar = ({ activeTab, setActiveTab, onOpenAddSchemeModal }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'schemes', label: 'Scheme Management', icon: FileText },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'logs', label: 'System Activity Logs', icon: Activity }
  ];

  return (
    <aside className="w-64 bg-[#0b1f33] text-slate-300 h-full flex flex-col justify-between p-4 shrink-0 border-r border-slate-800/80 shadow-xl select-none overflow-y-auto">
      <div>
        {/* Admin Console Branding Header */}
        <div className="p-3.5 mb-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white leading-tight">Admin Console</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Full Privileges
              </span>
            </div>
          </div>
        </div>

        {/* Create Scheme Primary Action */}
        <button
          onClick={onOpenAddSchemeModal}
          className="w-full mb-6 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0052cc] to-[#0041a3] hover:from-[#0041a3] hover:to-[#003380] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 text-amber-300 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Scheme</span>
        </button>

        {/* Navigation Tabs */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">
            Navigation Menu
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-blue-600/20 text-white border-l-4 border-amber-400 pl-3 shadow-inner'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
