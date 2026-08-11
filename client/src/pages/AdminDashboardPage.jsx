import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { schemeService } from '../services/schemeService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { AdminSidebar } from '../components/Sidebar';
import { SchemeModal } from '../components/SchemeModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { SchemeViewModal } from '../components/SchemeViewModal';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import {
  Building2,
  FileText,
  Users,
  PlusCircle,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Database,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ban,
  ShieldAlert,
  UserX,
  UserCheck
} from 'lucide-react';
import { SCHEME_CATEGORIES } from '../utils/constants';

export const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  // Schemes List State
  const [schemes, setSchemes] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('All');
  const [schemeStatus, setSchemeStatus] = useState('all');
  const [schemePage, setSchemePage] = useState(1);
  const [schemeLimit, setSchemeLimit] = useState(50);
  const [schemeTotalPages, setSchemeTotalPages] = useState(1);

  // Sorting State
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Users List State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Modals & Dialogs State
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [viewSchemeModalOpen, setViewSchemeModalOpen] = useState(false);
  const [viewSchemeData, setViewSchemeData] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null); // 'scheme' or 'user'
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemTitle, setDeleteItemTitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.stats);
        setRecentSchemes(res.recentSchemes || []);
        setRecentUsers(res.recentUsers || []);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  // Fetch Schemes Data Table
  const fetchSchemes = async () => {
    try {
      const res = await schemeService.getSchemes({
        page: schemePage,
        limit: schemeLimit === 9999 ? 500 : schemeLimit,
        search: schemeSearch || undefined,
        category: schemeCategory !== 'All' ? schemeCategory : undefined,
        status: schemeStatus
      });
      if (res.success) {
        setSchemes(res.schemes);
        setSchemeTotalPages(res.pages);
      }
    } catch (error) {
      console.error('Failed to load schemes table:', error);
    }
  };

  // Fetch Users Data Table
  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        page: userPage,
        limit: 10,
        search: userSearch || undefined,
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined
      });
      if (res.success) {
        setUsers(res.users);
        setUserTotalPages(res.pages);
      }
    } catch (error) {
      console.error('Failed to load users table:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchSchemes(), fetchUsers()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'schemes') fetchSchemes();
  }, [schemePage, schemeLimit, schemeCategory, schemeStatus]);

  // Debounced search trigger for schemes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'schemes') fetchSchemes();
    }, 400);
    return () => clearTimeout(timer);
  }, [schemeSearch]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [userPage, userRoleFilter]);

  // Debounced search trigger for users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      notifySuccess(`Sorted by ${field} (${newOrder.toUpperCase()})`);
    } else {
      setSortField(field);
      setSortOrder('asc');
      notifySuccess(`Sorted by ${field} (ASC)`);
    }
  };

  // Sort Schemes List Dynamically
  const sortedSchemes = [...schemes].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'title') {
      aVal = (a.title || '').toLowerCase();
      bVal = (b.title || '').toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sortField === 'category') {
      aVal = (a.category || '').toLowerCase();
      bVal = (b.category || '').toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sortField === 'maxIncome') {
      aVal = a.eligibility?.maxIncome ?? a.eligibilityCriteria?.maxIncome ?? 0;
      bVal = b.eligibility?.maxIncome ?? b.eligibilityCriteria?.maxIncome ?? 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (sortField === 'status') {
      aVal = (a.status === 'Active' || a.isActive) ? 'Active' : 'Inactive';
      bVal = (b.status === 'Active' || b.isActive) ? 'Active' : 'Inactive';
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    aVal = new Date(a.createdAt || 0).getTime();
    bVal = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Handle Save Scheme (Create or Edit)
  const handleSaveScheme = async (schemeData) => {
    setSubmitting(true);
    try {
      if (selectedScheme) {
        // Edit Existing Scheme
        const res = await schemeService.updateScheme(selectedScheme._id, schemeData);
        if (res.success) {
          notifySuccess(`Scheme "${schemeData.title}" updated successfully!`);
          setSchemeModalOpen(false);
          fetchSchemes();
          fetchStats();
        }
      } else {
        // Create New Scheme
        const res = await schemeService.createScheme(schemeData);
        if (res.success) {
          notifySuccess(`Scheme "${schemeData.title}" created successfully!`);
          setSchemeModalOpen(false);
          fetchSchemes();
          fetchStats();
        }
      }
    } catch (error) {
      notifyError(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Scheme Active Status
  const handleToggleSchemeStatus = async (scheme) => {
    try {
      const res = await schemeService.toggleSchemeStatus(scheme._id);
      if (res.success) {
        notifySuccess(`Scheme "${scheme.title}" ${res.scheme.isActive || res.scheme.status === 'Active' ? 'Activated' : 'Deactivated'}`);
        fetchSchemes();
        fetchStats();
      }
    } catch (error) {
      notifyError(error.message || 'Failed to toggle scheme status');
    }
  };

  // Open Delete Confirmation Dialog with Security Policy Checks
  const triggerDeleteConfirm = (type, id, title, targetUser = null) => {
    if (type === 'user' && targetUser) {
      if (targetUser._id === currentUser?._id || targetUser.email === currentUser?.email) {
        notifyError('Security Policy: Admin accounts cannot delete their own account.');
        return;
      }
      if (targetUser.role === 'admin') {
        notifyError('Security Policy: Cannot delete other Admin accounts.');
        return;
      }
    }
    setDeleteItemType(type);
    setDeleteItemId(id);
    setDeleteItemTitle(title);
    setConfirmModalOpen(true);
  };

  // Perform Confirmed Deletion
  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      if (deleteItemType === 'scheme') {
        const res = await schemeService.deleteScheme(deleteItemId);
        if (res.success) {
          notifySuccess(`Scheme "${deleteItemTitle}" deleted successfully!`);
          fetchSchemes();
          fetchStats();
        }
      } else if (deleteItemType === 'user') {
        const res = await adminService.deleteUser(deleteItemId);
        if (res.success) {
          notifySuccess(`User account deleted successfully!`);
          fetchUsers();
          fetchStats();
        }
      }
      setConfirmModalOpen(false);
    } catch (error) {
      notifyError(error.message || 'Deletion failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle User Role (User <-> Admin) with Security Policy Check
  const handleToggleUserRole = async (userItem) => {
    if (userItem._id === currentUser?._id || userItem.email === currentUser?.email) {
      notifyError('Security Policy: You cannot modify or demote your own admin account role.');
      return;
    }

    const newRole = userItem.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminService.updateUserRole(userItem._id, newRole);
      if (res.success) {
        notifySuccess(`User role updated to ${newRole}`);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update user role');
    }
  };

  // Toggle User Block Status (Block / Unblock Citizen User)
  const handleToggleBlockUser = async (userItem) => {
    if (userItem._id === currentUser?._id || userItem.email === currentUser?.email) {
      notifyError('Security Policy: Admin cannot block their own account.');
      return;
    }
    if (userItem.role === 'admin') {
      notifyError('Security Policy: Admin accounts cannot be blocked.');
      return;
    }

    try {
      const res = await adminService.toggleBlockUser(userItem._id);
      if (res.success) {
        if (res.user.isBlocked) {
          notifySuccess(`User "${userItem.name}" has been blocked. If logged in, they will be logged out automatically.`);
        } else {
          notifySuccess(`User "${userItem.name}" has been unblocked.`);
        }
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update user block status');
    }
  };

  // Render Sort Arrow
  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400 font-bold" />
    );
  };

  return (
    <PageMotionWrapper className="flex-1 flex min-h-0 overflow-hidden bg-slate-100">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddSchemeModal={() => {
          setSelectedScheme(null);
          setSchemeModalOpen(true);
        }}
      />

      {/* Main Admin Content View */}
      <main className="flex-1 min-h-0 overflow-y-auto scroll-smooth p-6 sm:p-8 space-y-8 bg-slate-50">

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Admin Control Center
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>MongoDB Live Sync</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time analytics, scheme auditing, and user access management
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchStats();
                    fetchSchemes();
                    fetchUsers();
                    notifySuccess('Dashboard data refreshed successfully!');
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Elevated Executive Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Schemes</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0052cc] flex items-center justify-center border border-blue-100">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats?.totalSchemes || 0}</span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Catalog</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Registered in central database</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Schemes</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#138808] flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-[#138808]">{stats?.activeSchemes || 0}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Published on citizen portal</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Inactive Schemes</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-600">{stats?.inactiveSchemes || 0}</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Draft</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Pending audit or suspended</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Registered Citizens</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {stats?.adminCount || 0} Admins
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Pan-India registered user accounts</p>
              </div>

            </div>

            {/* Recent Schemes & Users Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Schemes */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recently Added Schemes</h3>
                    <p className="text-[11px] text-slate-500">Latest welfare programs added to database</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('schemes')}
                    className="text-xs font-extrabold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {recentSchemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-400">No schemes added yet</p>
                      <button
                        onClick={() => { setSelectedScheme(null); setSchemeModalOpen(true); }}
                        className="text-xs font-extrabold text-[#0052cc] hover:underline cursor-pointer"
                      >
                        + Add First Scheme
                      </button>
                    </div>
                  ) : (
                    recentSchemes.map((scheme) => {
                      const active = scheme.status === 'Active' || scheme.isActive === true;
                      return (
                        <div key={scheme._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50/40 hover:border-blue-100 transition-all group">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Color dot */}
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="text-xs font-extrabold text-slate-900 truncate max-w-[200px]">{scheme.title}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span className="truncate max-w-[120px]">{scheme.department}</span>
                                <span>·</span>
                                <span className="text-blue-600 font-bold">{scheme.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={active ? 'success' : 'danger'}>
                              {active ? 'Active' : 'Inactive'}
                            </Badge>
                            <button
                              onClick={() => {
                                setViewSchemeData(scheme);
                                setViewSchemeModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#0052cc] hover:border-blue-200 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recent Users */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recent User Registrations</h3>
                    <p className="text-[11px] text-slate-500">Newly registered citizens and admins</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-extrabold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {recentUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-400">No registered users yet</p>
                    </div>
                  ) : (
                    recentUsers.map((u) => {
                      const isAdmin = u.role === 'admin';
                      const isBlocked = u.isBlocked;
                      return (
                        <div key={u._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50/40 hover:border-purple-100 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar Initial */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-extrabold text-slate-900 truncate max-w-[140px]">{u.name}</h4>
                                {isBlocked && (
                                  <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">BLOCKED</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span className="truncate max-w-[140px]">{u.email}</span>
                                {u.state && (
                                  <>
                                    <span>·</span>
                                    <span className="text-slate-600">{u.state}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={isAdmin ? 'accent' : 'default'}>
                            {u.role.toUpperCase()}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SCHEME CRUD MANAGEMENT */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">


            {/* Filter & Sorting Control Bar */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="relative col-span-1 sm:col-span-2">
                <input
                  type="text"
                  value={schemeSearch}
                  onChange={(e) => {
                    setSchemeSearch(e.target.value);
                    setSchemePage(1);
                  }}
                  placeholder="Search scheme name, department or category..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <select
                value={schemeCategory}
                onChange={(e) => {
                  setSchemeCategory(e.target.value);
                  setSchemePage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all font-medium text-slate-700"
              >
                {SCHEME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={schemeStatus}
                  onChange={(e) => {
                    setSchemeStatus(e.target.value);
                    setSchemePage(1);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all font-medium text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                {/* Display per page selector */}
                <select
                  value={schemeLimit}
                  onChange={(e) => {
                    setSchemeLimit(Number(e.target.value));
                    setSchemePage(1);
                  }}
                  className="px-2.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all font-bold text-slate-700 shrink-0"
                  title="Items per page"
                >
                  <option value={10}>10 / pg</option>
                  <option value={25}>25 / pg</option>
                  <option value={50}>50 / pg</option>
                  <option value={9999}>Show All</option>
                </select>
              </div>
            </div>

            {/* Interactive Schemes Data Table with Column Sorting */}
            <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f2942] text-white uppercase tracking-wider font-extrabold select-none">
                      <th
                        onClick={() => handleSort('title')}
                        className="p-4 pl-6 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Scheme Title & Dept</span>
                          {renderSortIcon('title')}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSort('category')}
                        className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Category</span>
                          {renderSortIcon('category')}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSort('maxIncome')}
                        className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Income Ceiling</span>
                          {renderSortIcon('maxIncome')}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSort('status')}
                        className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Status</span>
                          {renderSortIcon('status')}
                        </div>
                      </th>

                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedSchemes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                          No government schemes match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      sortedSchemes.map((scheme) => {
                        const active = scheme.status === 'Active' || scheme.isActive === true;
                        const maxInc = scheme.eligibility?.maxIncome ?? scheme.eligibilityCriteria?.maxIncome ?? 0;

                        return (
                          <tr key={scheme._id} className="hover:bg-slate-50/80 transition-colors">

                            {/* Title & Dept */}
                            <td className="p-4 pl-6">
                              <h4 className="font-bold text-slate-900 text-sm max-w-xs truncate">{scheme.title}</h4>
                              <span className="text-[11px] text-slate-500">{scheme.department}</span>
                            </td>

                            {/* Category */}
                            <td className="p-4">
                              <Badge variant="primary">{scheme.category}</Badge>
                            </td>

                            {/* Income Ceiling */}
                            <td className="p-4 font-bold text-slate-800">
                              ₹{maxInc.toLocaleString('en-IN')} / yr
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleSchemeStatus(scheme)}
                                className="flex items-center gap-1.5 font-bold cursor-pointer"
                                title="Click to toggle status"
                              >
                                {active ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 text-[11px]">
                                    <ToggleRight className="w-4 h-4 text-emerald-600" /> Active
                                  </span>
                                ) : (
                                  <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 text-[11px]">
                                    <ToggleLeft className="w-4 h-4 text-amber-600" /> Inactive
                                  </span>
                                )}
                              </button>
                            </td>

                            {/* Actions Column */}
                            <td className="p-4 pr-6 text-right space-x-1.5">

                              {/* View Details Action */}
                              <button
                                onClick={() => {
                                  setViewSchemeData(scheme);
                                  setViewSchemeModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-all"
                                title="Audit View Scheme Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Action */}
                              <button
                                onClick={() => {
                                  setSelectedScheme(scheme);
                                  setSchemeModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-blue-50 text-[#0052cc] hover:bg-blue-100 cursor-pointer transition-all"
                                title="Edit Scheme"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Action */}
                              <button
                                onClick={() => triggerDeleteConfirm('scheme', scheme._id, scheme.title)}
                                className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer transition-all"
                                title="Delete Scheme"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {schemeLimit !== 9999 && (
                <div className="p-4 border-t border-slate-100">
                  <Pagination page={schemePage} pages={schemeTotalPages} onPageChange={(p) => setSchemePage(p)} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: USER DIRECTORY & MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Registered Users Directory & Access Control
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Manage citizen profiles, toggle role privileges, and suspend/block access
              </p>
            </div>

            {/* Filter Bar */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Search by user name or email..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0052cc] outline-none transition-all font-medium text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Citizens</option>
                <option value="admin">System Admins</option>
              </select>
            </div>

            {/* Users Data Table */}
            <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f2942] text-white uppercase tracking-wider font-extrabold">
                      <th className="p-4 pl-6">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">State & Occupation</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelf = u._id === currentUser?._id || u.email === currentUser?.email;
                      const isAdminAccount = u.role === 'admin';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-900">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                (You)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                          <td className="p-4 text-slate-600 font-medium">
                            {u.state || 'Not Specified'} • {u.occupation || 'Other'}
                          </td>

                          {/* Role Column */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              disabled={isSelf}
                              className={`cursor-pointer ${isSelf ? 'opacity-70 cursor-not-allowed' : ''}`}
                              title={isSelf ? 'Admin cannot modify or demote their own account role' : 'Click to toggle Role'}
                            >
                              <Badge variant={isAdminAccount ? 'accent' : 'default'}>
                                {u.role.toUpperCase()}
                              </Badge>
                            </button>
                          </td>

                          {/* Blocked Status Pill Column */}
                          <td className="p-4">
                            {u.isBlocked ? (
                              <span className="text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1 font-bold text-[10px]">
                                <Ban className="w-3 h-3 text-rose-600" /> BLOCKED
                              </span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ACTIVE
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="p-4 pr-6 text-right space-x-1.5">

                            {/* Block / Unblock Action Button */}
                            <button
                              onClick={() => handleToggleBlockUser(u)}
                              disabled={isAdminAccount}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all ${isAdminAccount
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : u.isBlocked
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer'
                                }`}
                              title={isAdminAccount ? 'Admin accounts cannot be blocked' : u.isBlocked ? 'Unblock User' : 'Block User Access'}
                            >
                              {u.isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Unblock
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-amber-600" /> Block
                                </>
                              )}
                            </button>

                            {/* Delete User Action Button */}
                            <button
                              onClick={() => triggerDeleteConfirm('user', u._id, u.name, u)}
                              disabled={isAdminAccount || isSelf}
                              className={`p-2 rounded-xl transition-all ${isAdminAccount || isSelf
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer'
                                }`}
                              title={isSelf ? 'Admin cannot delete their own account' : isAdminAccount ? 'Cannot delete Admin accounts' : 'Delete User'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100">
                <Pagination page={userPage} pages={userTotalPages} onPageChange={(p) => setUserPage(p)} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                System Activity & Audit Stream
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Real-time audit log of scheme updates, user roles, and database activities
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">Database initialized & seeded with 12 flagship schemes</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">System Event</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-800">Admin Account active: admin@gmail.com</span>
                  </div>
                  <span className="text-amber-600 font-extrabold text-[11px] tracking-wider uppercase">ROLE: ADMIN</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">Automated Eligibility Matcher Engine v1.0 operational</span>
                  </div>
                  <span className="text-emerald-700 font-extrabold text-[11px]">STATUS: OK</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* View Scheme Audit Details Modal */}
      <SchemeViewModal
        isOpen={viewSchemeModalOpen}
        onClose={() => setViewSchemeModalOpen(false)}
        scheme={viewSchemeData}
        onEdit={(schemeToEdit) => {
          setSelectedScheme(schemeToEdit);
          setSchemeModalOpen(true);
        }}
      />

      {/* Scheme Form Modal (Create or Edit) */}
      <SchemeModal
        isOpen={schemeModalOpen}
        onClose={() => setSchemeModalOpen(false)}
        onSave={handleSaveScheme}
        scheme={selectedScheme}
        loading={submitting}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteItemType === 'scheme' ? 'Government Scheme' : 'User Account'}`}
        message={`Are you sure you want to delete "${deleteItemTitle}"? This will permanently remove it from MongoDB.`}
        loading={submitting}
      />
    </PageMotionWrapper>
  );
};
