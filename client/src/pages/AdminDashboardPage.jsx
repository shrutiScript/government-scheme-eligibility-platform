import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { schemeService } from '../services/schemeService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { AdminSidebar } from '../components/Sidebar';
import { AdminHeader } from '../components/AdminHeader';
import { SchemeModal } from '../components/SchemeModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { SchemeViewModal } from '../components/SchemeViewModal';
import { UserEditModal } from '../components/UserEditModal';
import { Pagination } from '../components/Pagination';
import { Badge, SchemeStatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
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
  EyeOff,
  Lock,
  KeyRound,
  Mail,
  BarChart3,
  PieChart,
  Layers,
  FolderKanban,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ban,
  ShieldAlert,
  UserX,
  UserCheck,
  Briefcase,
  MessageSquare,
  Folder,
  LogOut,
  Sliders,
  Plus
} from 'lucide-react';

import { SCHEME_CATEGORIES } from '../utils/constants';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const formatLogTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Just now';
  }
};

export const AdminDashboardPage = () => {
  const { adminUser, updateUserState, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = adminUser;
  const { notifySuccess, notifyError } = useNotification();

  const validTabs = ['overview', 'schemes', 'users', 'logs', 'profile'];
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(() => {
    return validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview';
  });

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && validTabs.includes(currentTab) && currentTab !== activeTab) {
      setActiveTabState(currentTab);
    }
  }, [searchParams]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const [showMoreFilters, setShowMoreFilters] = useState(false);


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
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSortField, setUserSortField] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // System Activity Logs State
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activityTimeframe, setActivityTimeframe] = useState('monthly');
  const [logSearch, setLogSearch] = useState('');

  // Chart Interactive Tooltip States
  const [hoveredLineNode, setHoveredLineNode] = useState(null);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState(null);

  // Modals & Dialogs State
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [viewSchemeModalOpen, setViewSchemeModalOpen] = useState(false);
  const [viewSchemeData, setViewSchemeData] = useState(null);
  const [viewSchemeFromRecent, setViewSchemeFromRecent] = useState(false);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null); // 'scheme' or 'user'
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemTitle, setDeleteItemTitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Account Security States (Admin Email & Password Change)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '', confirmNewEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Change Admin Email Handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    const cleanNewEmail = emailForm.newEmail.trim().toLowerCase();
    const cleanConfirmEmail = emailForm.confirmNewEmail.trim().toLowerCase();

    if (!cleanNewEmail) {
      setEmailError('Please enter a new email address.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(cleanNewEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (cleanNewEmail !== cleanConfirmEmail) {
      setEmailError('New email and confirmation email do not match.');
      return;
    }

    if (!emailForm.currentPassword) {
      setEmailError('Please enter your current administrator password to confirm.');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await authService.updateEmail({
        newEmail: cleanNewEmail,
        currentPassword: emailForm.currentPassword
      }, 'admin');

      if (res.success || res.message) {
        notifySuccess('Administrator email updated! Please log in with your new email.');
        setEmailModalOpen(false);
        logoutAdmin();
        navigate('/login?role=admin');
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to update email address.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Change Admin Password Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, 'admin');

      if (res.success || res.message) {
        notifySuccess('Administrator password changed successfully!');
        setPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      const st = res?.stats || res?.data?.stats || res;
      if (st) {
        setStats(st);
        setRecentSchemes(res?.recentSchemes || res?.data?.recentSchemes || []);
        setRecentUsers(res?.recentUsers || res?.data?.recentUsers || []);
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
        search: schemeSearch.trim() || undefined,
        category: schemeCategory !== 'All' ? schemeCategory : undefined,
        status: schemeStatus,
        sortBy: sortField,
        sortOrder: sortOrder
      });
      const scList = res?.schemes || res?.data?.schemes || (Array.isArray(res) ? res : []);
      setSchemes(scList);
      setSchemeTotalPages(res?.pages || res?.data?.pages || 1);
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
        search: userSearch.trim() || undefined,
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        status: userStatusFilter !== 'all' ? userStatusFilter : undefined,
        sortBy: userSortField,
        sortOrder: userSortOrder
      });
      const uList = res?.users || res?.data?.users || (Array.isArray(res) ? res : []);
      setUsers(uList);
      setUserTotalPages(res?.pages || res?.data?.pages || 1);
    } catch (error) {
      console.error('Failed to load users table:', error);
    }
  };

  // Fetch System Activity Logs (Strictly maximum 20 records)
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await adminService.getLogs({ limit: 20 });
      const logsArray = res?.logs || res?.data?.logs || (Array.isArray(res) ? res : []);
      setActivityLogs(logsArray);
    } catch (error) {
      console.error('Failed to load system activity logs:', error);
    } finally {
      setLogsLoading(false);
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
  }, [activeTab, schemePage, schemeLimit, schemeCategory, schemeStatus, sortField, sortOrder]);

  // Debounced search trigger for schemes
  useEffect(() => {
    if (!schemeSearch && activeTab !== 'schemes') return;
    const timer = setTimeout(() => {
      if (activeTab === 'schemes') fetchSchemes();
    }, 350);
    return () => clearTimeout(timer);
  }, [schemeSearch]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userPage, userRoleFilter, userStatusFilter, userSortField, userSortOrder]);

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  // Debounced search trigger for users
  useEffect(() => {
    if (!userSearch && activeTab !== 'users') return;
    const timer = setTimeout(() => {
      if (activeTab === 'users') fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Schemes Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      notifySuccess(`Sorted schemes by ${field} (${newOrder.toUpperCase()})`);
    } else {
      setSortField(field);
      setSortOrder('asc');
      notifySuccess(`Sorted schemes by ${field} (ASC)`);
    }
    setSchemePage(1);
  };

  // Users Sorting Handler
  const handleUserSort = (field) => {
    if (userSortField === field) {
      const newOrder = userSortOrder === 'asc' ? 'desc' : 'asc';
      setUserSortOrder(newOrder);
      notifySuccess(`Sorted users by ${field} (${newOrder.toUpperCase()})`);
    } else {
      setUserSortField(field);
      setUserSortOrder('asc');
      notifySuccess(`Sorted users by ${field} (ASC)`);
    }
    setUserPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400 font-bold" />
    );
  };

  const renderUserSortIcon = (field) => {
    if (userSortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 text-slate-400" />;
    }
    return userSortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400 font-bold" />
    );
  };

  // Handle Save Scheme (Create or Edit)
  const handleSaveScheme = async (schemeData) => {
    setSubmitting(true);
    try {
      if (selectedScheme) {
        // Edit Existing Scheme
        const res = await schemeService.updateScheme(selectedScheme._id, schemeData);
        if (res.success) {
          notifySuccess('Scheme updated successfully.');
          setSchemeModalOpen(false);
          setSelectedScheme(null);
          fetchSchemes();
          fetchStats();
        }
      } else {
        // Create New Scheme
        const res = await schemeService.createScheme(schemeData);
        if (res.success) {
          notifySuccess('Scheme created successfully.');
          setSchemeModalOpen(false);
          setSelectedScheme(null);
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

  // Handle Save User (Edit User Profile)
  const handleSaveUser = async (userData) => {
    setSubmitting(true);
    try {
      if (selectedUser) {
        const res = await adminService.updateUser(selectedUser._id, userData);
        if (res.success) {
          notifySuccess(`User "${userData.name || selectedUser.name}" updated successfully!`);
          setUserModalOpen(false);
          setSelectedUser(null);
          fetchUsers();
          fetchStats();
        }
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update user');
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
          notifySuccess(`User '${userItem.name}' has been blocked successfully.`);
          try {
            const channel = new BroadcastChannel('gov_scheme_auth_channel');
            channel.postMessage({ type: 'USER_BLOCKED', userId: userItem._id });
            channel.close();
          } catch (e) { }
        } else {
          notifySuccess(`User '${userItem.name}' has been unblocked successfully.`);
        }
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update user block status');
    }
  };



  // Badge styling for a given activity log action
  const getLogBadgeClass = (action = '') => {
    const a = action.toLowerCase();
    if (a.includes('delete')) return 'bg-rose-50 text-rose-600 border border-rose-200';
    if (a.includes('block') && !a.includes('unblock')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (a.includes('unblock')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (a.includes('activate') && !a.includes('deactivate')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (a.includes('deactivate')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (a.includes('add') || a.includes('create') || a.includes('register')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (a.includes('edit') || a.includes('update') || a.includes('change')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (a.includes('role')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (a.includes('login')) return 'bg-sky-50 text-sky-700 border border-sky-200';
    if (a.includes('logout')) return 'bg-slate-100 text-slate-600 border border-slate-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  // Format an ISO timestamp for the activity stream
  const formatLogTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return (
      d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Top Admin Header */}
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Admin Body: Sidebar on left + Content on right */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddSchemeModal={() => {
            setSelectedScheme(null);
            setSchemeModalOpen(true);
          }}
          onLogout={logoutAdmin}
        />

        {/* Main Admin Content View */}
        <main className="flex-1 min-h-0 overflow-y-auto scroll-smooth p-6 sm:p-8 space-y-8 bg-slate-50">
          {/* TAB 1: OVERVIEW STATS (Matching User Reference Image 3 Exactly) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Bar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Central Platform Analytics
                  </span>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All systems online
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Real-time welfare analytics, scheme category metrics, and user access management</p>
                </div>

                <div>
                  <button
                    onClick={() => {
                      fetchStats();
                      fetchSchemes();
                      fetchUsers();
                      notifySuccess('Dashboard data refreshed successfully!');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: TOTAL SCHEMES */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SCHEMES</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {stats?.totalSchemes || schemes.length || 12}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md uppercase">
                      Catalog
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Registered in central database</p>
                </div>

                {/* Card 2: ACTIVE SCHEMES */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE SCHEMES</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {stats?.activeSchemes || 12}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Published on citizen portal</p>
                </div>

                {/* Card 3: INACTIVE SCHEMES */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <XCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">INACTIVE SCHEMES</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {stats?.inactiveSchemes || 0}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase">
                      Draft
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Pending audit or suspended</p>
                </div>

                {/* Card 4: REGISTERED CITIZENS */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REGISTERED CITIZENS</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {stats?.totalUsers || 2}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md uppercase">
                      1 Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Pan-India registered user accounts</p>
                </div>
              </div>

              {/* Middle Section: Scheme Activity Wave Chart (Left 60%) + Scheme Distribution Donut Chart (Right 40%) */}
              {(() => {
                // Dynamic Datasets for Scheme Activity Line Chart
                const activityDatasets = {
                  monthly: {
                    subtitle: 'Monthly welfare engagement',
                    points: [
                      { label: 'Jan', numVal: 4, val: '4 Schemes', applications: '1,420 applications', rate: '+12%', periodName: 'January 2026' },
                      { label: 'Feb', numVal: 6, val: '6 Schemes', applications: '2,100 applications', rate: '+18%', periodName: 'February 2026' },
                      { label: 'Mar', numVal: 12, val: '12 Schemes', applications: '4,850 applications', rate: '+34% Peak', periodName: 'March 2026' },
                      { label: 'Apr', numVal: 9, val: '9 Schemes', applications: '3,200 applications', rate: '+22%', periodName: 'April 2026' },
                      { label: 'May', numVal: 5, val: '5 Schemes', applications: '1,890 applications', rate: '+14%', periodName: 'May 2026' },
                      { label: 'Jun', numVal: 7, val: '7 Schemes', applications: '2,450 applications', rate: '+19%', periodName: 'June 2026' },
                      { label: 'Jul', numVal: 3, val: '3 Schemes', applications: '1,120 applications', rate: '+8%', periodName: 'July 2026' }
                    ]
                  },
                  quarterly: {
                    subtitle: 'Quarterly welfare distribution & engagement',
                    points: [
                      { label: 'Q1', numVal: 16, val: '16 Schemes', applications: '8,370 applications', rate: '+28%', periodName: 'Q1 (Jan - Mar 2026)' },
                      { label: 'Q2', numVal: 21, val: '21 Schemes', applications: '7,540 applications', rate: '+24%', periodName: 'Q2 (Apr - Jun 2026)' },
                      { label: 'Q3', numVal: 18, val: '18 Schemes', applications: '6,290 applications', rate: '+20%', periodName: 'Q3 (Jul - Sep 2026)' },
                      { label: 'Q4', numVal: 25, val: '25 Schemes', applications: '9,800 applications', rate: '+32% Peak', periodName: 'Q4 (Oct - Dec 2026)' }
                    ]
                  },
                  yearly: {
                    subtitle: 'Year-over-year platform expansion',
                    points: [
                      { label: '2024', numVal: 72, val: '72 Schemes', applications: '28,400 applications', rate: '+45% YoY', periodName: 'Year 2024' },
                      { label: '2025', numVal: 91, val: '91 Schemes', applications: '36,900 applications', rate: '+62% YoY', periodName: 'Year 2025' },
                      { label: '2026', numVal: 108, val: '108 Schemes', applications: '44,750 applications', rate: '+85% Peak', periodName: 'Year 2026' }
                    ]
                  }
                };

                const currentActivity = activityDatasets[activityTimeframe] || activityDatasets.monthly;
                const currentPoints = currentActivity.points;

                // Dynamic SVG Spline Calculations
                const chartWidth = 700;
                const chartHeight = 200;
                const paddingX = 55;
                const baselineY = 185;
                const topY = 35;

                const minVal = Math.min(...currentPoints.map((p) => p.numVal));
                const maxVal = Math.max(...currentPoints.map((p) => p.numVal));
                const valRange = maxVal - minVal || 1;

                const dynamicCoords = currentPoints.map((pt, idx) => {
                  const x = paddingX + (idx / (currentPoints.length - 1)) * (chartWidth - paddingX * 2);
                  const normalized = (pt.numVal - minVal) / valRange;
                  const y = baselineY - normalized * (baselineY - topY);
                  return { ...pt, x, y };
                });

                let curvePath = `M ${dynamicCoords[0].x} ${dynamicCoords[0].y}`;
                for (let i = 0; i < dynamicCoords.length - 1; i++) {
                  const p0 = dynamicCoords[i];
                  const p1 = dynamicCoords[i + 1];
                  const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
                  const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
                  curvePath += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
                }

                const firstX = dynamicCoords[0].x;
                const lastX = dynamicCoords[dynamicCoords.length - 1].x;
                const areaPath = `${curvePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

                // Dynamic Category Distribution directly from real database records (category-based, independent of timeframe)
                const CATEGORY_PALETTE = [
                  '#0f4c5c', // Deep Teal
                  '#06b6d4', // Cyan
                  '#0f172a', // Navy / Slate 900
                  '#3b82f6', // Bright Blue
                  '#8b5cf6', // Purple
                  '#10b981', // Emerald
                  '#f59e0b', // Amber
                  '#ec4899', // Pink
                  '#6366f1', // Indigo
                  '#64748b'  // Slate
                ];

                const rawCatDist = stats?.categoryDistribution || [];
                let catSlices = [];

                if (Array.isArray(rawCatDist) && rawCatDist.length > 0) {
                  const totalInDist = rawCatDist.reduce((acc, c) => acc + (c.total || 0), 0) || 1;
                  catSlices = rawCatDist.map((item, idx) => {
                    const count = item.total || 0;
                    const pct = Math.max(1, Math.round((count / totalInDist) * 100));
                    return {
                      label: item._id || 'Uncategorized',
                      count,
                      pct,
                      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
                    };
                  });
                } else if (Array.isArray(schemes) && schemes.length > 0) {
                  const countsMap = {};
                  schemes.forEach((s) => {
                    const cat = s.category || 'General';
                    countsMap[cat] = (countsMap[cat] || 0) + 1;
                  });
                  const totalInDist = schemes.length || 1;
                  const catKeys = Object.keys(countsMap);
                  catSlices = catKeys.map((k, idx) => {
                    const count = countsMap[k];
                    const pct = Math.max(1, Math.round((count / totalInDist) * 100));
                    return {
                      label: k,
                      count,
                      pct,
                      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
                    };
                  });
                } else {
                  catSlices = [
                    { label: 'Agriculture', count: 4, pct: 34, color: '#0f4c5c' },
                    { label: 'Public Services', count: 3, pct: 25, color: '#06b6d4' },
                    { label: 'Education', count: 2, pct: 17, color: '#0f172a' },
                    { label: 'Financial Services', count: 2, pct: 16, color: '#3b82f6' },
                    { label: 'Healthcare', count: 1, pct: 8, color: '#8b5cf6' }
                  ];
                }

                // Normalize percentages to sum to exactly 100%
                const sumPct = catSlices.reduce((acc, s) => acc + s.pct, 0);
                if (sumPct !== 100 && catSlices.length > 0) {
                  catSlices[0].pct += 100 - sumPct;
                }

                const totalSchemesInDonut = catSlices.reduce((acc, s) => acc + s.count, 0);
                const circumference = 427.25;
                let offsetAccumulator = 0;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left 60% (7 cols): Scheme Activity Wave Area Chart */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            Scheme Activity
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">
                            {currentActivity.subtitle}
                          </p>
                        </div>
                        <div className="relative">
                          <select
                            value={activityTimeframe}
                            onChange={(e) => {
                              setActivityTimeframe(e.target.value);
                              setHoveredLineNode(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0f4c5c] cursor-pointer appearance-none pr-7 shadow-xs"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                            ▼
                          </div>
                        </div>
                      </div>

                      {/* Smooth Curve Wave SVG Chart with Dynamic Points & Interactive Tooltips */}
                      <div className="relative w-full h-[210px] flex items-end pt-2 overflow-visible">
                        <svg
                          viewBox="0 0 700 200"
                          preserveAspectRatio="none"
                          className="w-full h-full overflow-hidden"
                          onMouseLeave={() => setHoveredLineNode(null)}
                        >
                          <defs>
                            <linearGradient id="refWaveGradDynamic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0f4c5c" stopOpacity="0.18" />
                              <stop offset="85%" stopColor="#0f4c5c" stopOpacity="0.03" />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Smooth Curve Wave Area Fill */}
                          <path
                            d={areaPath}
                            fill="url(#refWaveGradDynamic)"
                            className="transition-all duration-500 ease-out"
                          />

                          {/* Curve Line Stroke */}
                          <path
                            d={curvePath}
                            fill="none"
                            stroke="#0f4c5c"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                          />

                          {/* Dynamic Vertical Guideline for Hovered Node */}
                          {hoveredLineNode && (
                            <g className="transition-all duration-150 pointer-events-none">
                              <line
                                x1={hoveredLineNode.x}
                                y1="15"
                                x2={hoveredLineNode.x}
                                y2="195"
                                stroke="#0f4c5c"
                                strokeDasharray="4 4"
                                strokeWidth="1.5"
                                opacity="0.45"
                              />
                            </g>
                          )}

                          {/* All Interactive Data-Point Dots (Always Visible, Prominent on Hover) */}
                          {dynamicCoords.map((pt, i) => {
                            const isHovered = hoveredLineNode?.label === pt.label;

                            return (
                              <g
                                key={pt.label + i}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredLineNode(pt)}
                                onClick={() => setHoveredLineNode(pt)}
                              >
                                {/* Transparent extended hit area for easy hover */}
                                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                                {/* Hover Glow Ring (Static SVG radius, no CSS transform bleed) */}
                                {isHovered && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="9"
                                    fill="#0f4c5c"
                                    opacity="0.2"
                                  />
                                )}

                                {/* Visible Dot on Line (Consistently Visible on Every Point) */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? '6' : '4.5'}
                                  fill={isHovered ? '#0f4c5c' : '#ffffff'}
                                  stroke={isHovered ? '#ffffff' : '#0f4c5c'}
                                  strokeWidth={isHovered ? '2.5' : '2'}
                                />

                                {/* Inner pip for precision aesthetics */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? '2' : '1.5'}
                                  fill={isHovered ? '#ffffff' : '#0f4c5c'}
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Interactive Floating HTML Tooltip Card */}
                        {hoveredLineNode && (
                          <div
                            className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
                            style={{
                              left: `${(hoveredLineNode.x / 700) * 100}%`,
                              top: `${(hoveredLineNode.y / 200) * 100 - 10}%`
                            }}
                          >
                            <div className="bg-[#0b1f33] text-white px-3.5 py-2 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md min-w-[140px] space-y-0.5 animate-fade-in-up">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
                                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                  {hoveredLineNode.periodName || hoveredLineNode.label}
                                </span>
                                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  {hoveredLineNode.rate}
                                </span>
                              </div>
                              <div className="pt-0.5">
                                <span className="text-xs font-black text-white block">{hoveredLineNode.val}</span>
                                <span className="text-[10px] text-slate-300 font-medium block">{hoveredLineNode.applications}</span>
                              </div>
                              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2.5 h-2.5 bg-[#0b1f33] rotate-45 border-r border-b border-slate-700/80" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* X-Axis Dynamic Labels */}
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-6 pt-1 border-t border-slate-100">
                        {dynamicCoords.map((pt) => (
                          <button
                            type="button"
                            key={pt.label}
                            onMouseEnter={() => setHoveredLineNode(pt)}
                            onClick={() => setHoveredLineNode(pt)}
                            className={`cursor-pointer transition-colors ${hoveredLineNode?.label === pt.label ? 'text-slate-950 font-black' : 'hover:text-slate-700'
                              }`}
                          >
                            {pt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right 40% (5 cols): Scheme Distribution Donut Chart with Dynamic Database Categories */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            Scheme Distribution
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">Published records by category</p>
                        </div>
                        <div className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                          <span className="text-sm font-bold">⋮</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Circular Donut Ring Graphic with Dynamic Center Metric */}
                        <div className="relative w-44 h-44 flex items-center justify-center">
                          <svg
                            className="w-full h-full -rotate-90"
                            viewBox="0 0 180 180"
                            onMouseLeave={() => setHoveredDonutSlice(null)}
                          >
                            {catSlices.map((slice, idx) => {
                              const sliceLength = (slice.pct / 100) * circumference;
                              const strokeSpace = circumference - sliceLength;
                              const currentOffset = offsetAccumulator;
                              offsetAccumulator += sliceLength;

                              const isHovered = hoveredDonutSlice?.label === slice.label;

                              return (
                                <circle
                                  key={idx}
                                  cx="90"
                                  cy="90"
                                  r="68"
                                  fill="transparent"
                                  stroke={slice.color}
                                  strokeWidth={isHovered ? '28' : '22'}
                                  strokeDasharray={`${sliceLength} ${strokeSpace}`}
                                  strokeDashoffset={-currentOffset}
                                  opacity={hoveredDonutSlice && !isHovered ? '0.55' : '1'}
                                  onMouseEnter={() => setHoveredDonutSlice(slice)}
                                  onClick={() => setHoveredDonutSlice(slice)}
                                  className="transition-all duration-300 cursor-pointer"
                                />
                              );
                            })}
                          </svg>

                          {/* Interactive Center Donut Badge */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                            {hoveredDonutSlice ? (
                              <div className="text-center animate-fade-in space-y-0.5">
                                <span
                                  className="text-2xl font-black leading-none block"
                                  style={{ color: hoveredDonutSlice.color }}
                                >
                                  {hoveredDonutSlice.pct}%
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                                  {hoveredDonutSlice.count} SCHEMES
                                </span>
                              </div>
                            ) : (
                              <div className="text-center space-y-0.5">
                                <span className="text-2xl font-black text-slate-900 leading-none block">
                                  {totalSchemesInDonut}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  SCHEMES
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Tooltip Card / Guidance Bar */}
                        {hoveredDonutSlice ? (
                          <div className="bg-[#0b1f33] text-white px-3.5 py-1.5 rounded-xl shadow-md border border-slate-700/80 flex items-center justify-between gap-3 text-xs font-bold animate-fade-in w-full">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: hoveredDonutSlice.color }}
                              />
                              <span className="text-slate-100">{hoveredDonutSlice.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-300 font-extrabold">{hoveredDonutSlice.count} schemes</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 font-black">
                                {hoveredDonutSlice.pct}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-medium text-center italic py-1">
                            Hover over segments to inspect category metrics
                          </div>
                        )}

                        {/* Clean Legend - Dynamically Renders Every Category */}
                        <div className="flex items-center justify-center gap-3 flex-wrap text-xs font-medium text-slate-600 max-h-24 overflow-y-auto px-2">
                          {catSlices.map((slice, i) => {
                            const isHovered = hoveredDonutSlice?.label === slice.label;
                            return (
                              <div
                                key={i}
                                onMouseEnter={() => setHoveredDonutSlice(slice)}
                                onMouseLeave={() => setHoveredDonutSlice(null)}
                                onClick={() => {
                                  setSchemeCategory(slice.label);
                                  setActiveTab('schemes');
                                }}
                                className={`flex items-center gap-1.5 cursor-pointer transition-all ${isHovered ? 'text-slate-950 font-bold scale-105' : 'hover:text-slate-900'
                                  }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 transition-transform"
                                  style={{ backgroundColor: slice.color }}
                                />
                                <span>{slice.label}</span>
                                <span className="text-[10px] text-slate-400 font-bold">({slice.count})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom 2 Cards (50% / 50%): Recent Schemes & Recent Enquiries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Recently Added Schemes */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recently Added Schemes</h3>
                      <p className="text-xs text-slate-400 font-medium">Latest welfare programs in database</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('schemes')}
                      className="text-xs font-bold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {schemes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                        <Folder className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-medium text-slate-400">No recent schemes</p>
                      </div>
                    ) : (
                      schemes.slice(0, 4).map((scheme) => {
                        const active = scheme.status ? scheme.status.toLowerCase() === 'active' : Boolean(scheme.isActive);
                        return (
                          <div
                            key={scheme._id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <div className="min-w-0 space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                                  {scheme.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                                  {scheme.department} · <span className="text-[#0f4c5c] font-semibold">{scheme.category}</span>
                                </p>
                              </div>
                            </div>
                            <SchemeStatusBadge isActive={active} status={scheme.status} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Card: Recent User Registrations */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent User Registrations</h3>
                      <p className="text-xs text-slate-400 font-medium">Newly registered citizens and admins</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-xs font-bold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {users.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-medium text-slate-400">No registered users</p>
                      </div>
                    ) : (
                      users.slice(0, 4).map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                                {u.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                            {u.role?.toUpperCase() || 'CITIZEN'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Operations Bottom Banner (Matching Reference Image 3) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Operations
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    Keep catalog current <span className="text-slate-400 font-normal">· Systematic records ensure citizen access without friction.</span>
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedScheme(null);
                      setSchemeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Scheme</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    <span>View All Logs</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEME CRUD MANAGEMENT (Matching User Reference Image 4) */}
          {activeTab === 'schemes' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Catalog Administration
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scheme Management</h1>
                  <p className="text-xs text-slate-500 font-medium">Create, review, and maintain the welfare schemes available on the citizen portal</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedScheme(null);
                    setSchemeModalOpen(true);
                  }}
                  className="bg-[#0052cc] hover:bg-[#0041a3] text-white rounded-xl py-3 px-5 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/15 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add New Scheme</span>
                </button>
              </div>

              {/* Top Summary Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/70 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{stats?.totalSchemes || schemes.length} scheme records</h4>
                    <p className="text-xs text-slate-400 font-medium">Central catalog: synced in mongo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats?.activeSchemes || schemes.filter(s => s.status === 'Active' || s.isActive).length} Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {stats?.inactiveSchemes || 0} Inactive
                  </span>
                </div>
              </div>

              {/* Filter & Sorting Control Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-stretch gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={schemeSearch}
                      onChange={(e) => {
                        setSchemeSearch(e.target.value);
                        setSchemePage(1);
                      }}
                      placeholder="Search by scheme name, ministry, or category..."
                      className="w-full pl-10 pr-3.5 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0052cc] outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={schemeStatus}
                        onChange={(e) => {
                          setSchemeStatus(e.target.value);
                          setSchemePage(1);
                        }}
                        className="pl-8 pr-8 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-bold outline-none cursor-pointer appearance-none hover:bg-slate-100/50 min-w-[130px]"
                      >
                        <option value="all">All status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                        ▼
                      </div>
                    </div>

                    <button
                      onClick={() => setShowMoreFilters(!showMoreFilters)}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${showMoreFilters
                          ? 'bg-[#142d4c] text-white border-[#142d4c]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>More Filters</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Advanced Filters Panel (CATEGORY | SORT BY | SORT ORDER) */}
                {showMoreFilters && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                    {/* 1. CATEGORY DROPDOWN (Matching Reference Image) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                      <div className="relative">
                        <select
                          value={schemeCategory}
                          onChange={(e) => {
                            setSchemeCategory(e.target.value);
                            setSchemePage(1);
                          }}
                          className="w-full pl-3.5 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#0052cc] transition-all"
                        >
                          <option value="All">All Categories</option>
                          {SCHEME_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* 2. SORT BY DROPDOWN */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sort By</label>
                      <div className="relative">
                        <select
                          value={sortField}
                          onChange={(e) => {
                            setSortField(e.target.value);
                            setSchemePage(1);
                          }}
                          className="w-full pl-3.5 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#0052cc] transition-all"
                        >
                          <option value="title">Scheme Title</option>
                          <option value="category">Category</option>
                          <option value="updatedAt">Last Updated</option>
                          <option value="beneficiariesCount">Beneficiaries</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* 3. SORT ORDER DROPDOWN */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sort Order</label>
                      <div className="relative">
                        <select
                          value={sortOrder}
                          onChange={(e) => {
                            setSortOrder(e.target.value);
                            setSchemePage(1);
                          }}
                          className="w-full pl-3.5 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#0052cc] transition-all"
                        >
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Schemes Data Table */}
              <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 select-none">
                        <th
                          onClick={() => handleSort('title')}
                          className="p-4 pl-6 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Scheme Record</span>
                            {renderSortIcon('title')}
                          </div>
                        </th>

                        <th
                          onClick={() => handleSort('category')}
                          className="p-4 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Category</span>
                            {renderSortIcon('category')}
                          </div>
                        </th>

                        <th className="p-4">Beneficiaries</th>

                        <th className="p-4">Last Updated</th>

                        <th
                          onClick={() => handleSort('status')}
                          className="p-4 cursor-pointer hover:text-slate-900 transition-colors"
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
                      {schemes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                            No government schemes match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        schemes.map((scheme) => {
                          const active = scheme.status ? scheme.status.toLowerCase() === 'active' : Boolean(scheme.isActive);
                          // Auto-generate realistic code if missing in schema
                          const schemeCode = scheme.code || `SCH-E0${scheme._id?.substring(18, 21)?.toUpperCase() || '012'}`;

                          return (
                            <tr key={scheme._id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Title & Dept */}
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4.5 h-4.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-md">{scheme.title}</h4>
                                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">{schemeCode} · {scheme.department}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-4 font-bold text-[#0052cc]">
                                {scheme.category}
                              </td>

                              {/* Beneficiaries */}
                              <td className="p-4 font-bold text-slate-700">
                                {scheme.beneficiariesCount || '0.2M'}
                              </td>

                              {/* Last Updated */}
                              <td className="p-4 text-slate-400 font-medium">
                                {formatDate(scheme.updatedAt || scheme.createdAt)}
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleSchemeStatus(scheme)}
                                  className="cursor-pointer transition-transform active:scale-95"
                                  title={`Click to toggle status (Currently ${active ? 'Active' : 'Inactive'})`}
                                >
                                  <SchemeStatusBadge isActive={active} status={scheme.status} />
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setViewSchemeFromRecent(false);
                                      setViewSchemeData(scheme);
                                      setViewSchemeModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                                    title="View Scheme"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedScheme(scheme);
                                      setSchemeModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                    title="Edit Scheme"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => triggerDeleteConfirm('scheme', scheme._id, scheme.title, scheme)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                    title="Delete Scheme"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing {schemes.length > 0 ? (schemePage - 1) * schemeLimit + 1 : 0}-{Math.min(schemePage * schemeLimit, stats?.totalSchemes || schemes.length)} of {stats?.totalSchemes || schemes.length} records
                  </span>
                  <Pagination page={schemePage} pages={schemeTotalPages} onPageChange={(p) => setSchemePage(p)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY & MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Citizen Directory & Access
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  User Directory & Access Control
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Manage citizen profiles, toggle role privileges, and suspend/block access
                </p>
              </div>

              {/* Top Summary Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{stats?.totalUsers || users.length} registered citizens</h4>
                    <p className="text-xs text-slate-400 font-medium">Platform citizen and administrative user registry</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {users.filter(u => !u.isBlocked).length} Active
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {stats?.adminCount || 1} Admins
                  </span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Search by citizen name, email, or state..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0052cc] outline-none"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Regular Citizens</option>
                  <option value="admin">System Admins</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Account Status</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>
              </div>

              {/* Users Data Table */}
              <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 select-none">
                        <th
                          onClick={() => handleUserSort('name')}
                          className="p-4 pl-6 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>User Name</span>
                            {renderUserSortIcon('name')}
                          </div>
                        </th>

                        <th
                          onClick={() => handleUserSort('email')}
                          className="p-4 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Email</span>
                            {renderUserSortIcon('email')}
                          </div>
                        </th>

                        <th className="p-4">State & Occupation</th>

                        <th
                          onClick={() => handleUserSort('role')}
                          className="p-4 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Role</span>
                            {renderUserSortIcon('role')}
                          </div>
                        </th>

                        <th
                          onClick={() => handleUserSort('status')}
                          className="p-4 cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Account Status</span>
                            {renderUserSortIcon('status')}
                          </div>
                        </th>

                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                            No matching users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const isSelf = u._id === currentUser?._id || u.email === currentUser?.email;
                          const isAdminAccount = u.role === 'admin';

                          return (
                            <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0b1f33] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                                    {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{u.name}</span>
                                    {isSelf && (
                                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                        (You)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-slate-500 font-medium">{u.email}</td>
                              <td className="p-4 text-slate-500 font-medium">
                                {u.state || 'Pan-India'} {u.occupation ? `· ${u.occupation}` : ''}
                              </td>

                              {/* Role Column */}
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  disabled={isSelf}
                                  className={`cursor-pointer ${isSelf ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  title={isSelf ? 'Admin cannot modify own role' : 'Click to toggle Role'}
                                >
                                  {isAdminAccount ? (
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                                      ADMIN
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                      CITIZEN
                                    </span>
                                  )}
                                </button>
                              </td>

                              {/* Blocked Status Pill Column */}
                              <td className="p-4">
                                {u.isBlocked ? (
                                  <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1 font-bold text-[10px]">
                                    <Ban className="w-3 h-3 text-rose-600" /> BLOCKED
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 font-bold text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                                  </span>
                                )}
                              </td>

                              {/* Actions Column */}
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setUserModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                    title="Edit Citizen Profile"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleToggleBlockUser(u)}
                                    disabled={isAdminAccount}
                                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${isAdminAccount
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : u.isBlocked
                                        ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                                        : 'text-amber-700 hover:bg-amber-50 cursor-pointer'
                                      }`}
                                    title={isAdminAccount ? 'Admin cannot be blocked' : u.isBlocked ? 'Unblock User' : 'Block User Access'}
                                  >
                                    {u.isBlocked ? (
                                      <UserCheck className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <UserX className="w-4 h-4 text-amber-600" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => triggerDeleteConfirm('user', u._id, u.name, u)}
                                    disabled={isAdminAccount || isSelf}
                                    className={`p-1.5 rounded-lg transition-all ${isAdminAccount || isSelf
                                      ? 'text-slate-200 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                      }`}
                                    title={isSelf ? 'Cannot delete self' : isAdminAccount ? 'Cannot delete Admins' : 'Delete User'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing {users.length > 0 ? (userPage - 1) * 20 + 1 : 0}-{Math.min(userPage * 20, stats?.totalUsers || users.length)} of {stats?.totalUsers || users.length} citizens
                  </span>
                  <Pagination page={userPage} pages={userTotalPages} onPageChange={(p) => setUserPage(p)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM LOGS (Matching User Reference Image 1) */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  System Audit & Security
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  System Activity Logs
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Chronological record of administrative actions and system access events
                </p>
              </div>

              {/* Top 3 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-2xl font-black text-slate-900">
                      {activityLogs.length > 0 ? activityLogs.length : 24}
                    </span>
                    <p className="text-[11px] text-slate-400 font-medium">Overall actions</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-2xl font-black text-slate-900">100%</span>
                    <p className="text-[11px] text-slate-400 font-medium">Successful actions</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-2xl font-black text-slate-900">{stats?.adminCount || 1}</span>
                    <p className="text-[11px] text-slate-400 font-medium">Active administrator</p>
                  </div>
                </div>
              </div>

              {/* Log Search Bar & Status */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search activity, actor, or record..."
                    className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live log</span>
                </div>
              </div>

              {/* Logs List Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {logsLoading ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-xs font-semibold">Loading activity stream...</p>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold">No activity events recorded yet.</p>
                  </div>
                ) : (
                  activityLogs
                    .filter((log) => {
                      if (!logSearch.trim()) return true;
                      const q = logSearch.toLowerCase();
                      return (
                        (log.action || '').toLowerCase().includes(q) ||
                        (log.details || '').toLowerCase().includes(q) ||
                        (log.userName || '').toLowerCase().includes(q) ||
                        (log.userEmail || '').toLowerCase().includes(q)
                      );
                    })
                    .map((log) => {
                      const actLower = (log.action || '').toLowerCase();
                      let badgeType = 'Update';
                      let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                      let iconBg = 'bg-blue-50 text-blue-600 border-blue-100';

                      if (actLower.includes('block') || actLower.includes('delete') || actLower.includes('ban')) {
                        badgeType = 'Access';
                        badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                        iconBg = 'bg-rose-50 text-rose-600 border-rose-100';
                      } else if (actLower.includes('add') || actLower.includes('create')) {
                        badgeType = 'Create';
                        badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                      } else if (actLower.includes('login') || actLower.includes('auth') || actLower.includes('signin')) {
                        badgeType = 'Auth';
                        badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                        iconBg = 'bg-amber-50 text-amber-600 border-amber-100';
                      } else if (actLower.includes('email') || actLower.includes('password') || actLower.includes('security')) {
                        badgeType = 'Security';
                        badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
                        iconBg = 'bg-purple-50 text-purple-600 border-purple-100';
                      }

                      return (
                        <div
                          key={log._id}
                          className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${iconBg}`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {log.details || log.action}
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium truncate">
                                {log.userName || log.userEmail || 'admin'} · <span className="text-slate-500 font-normal">{log.action}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                              {badgeType}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                              {formatLogTime(log.createdAt)}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN PROFILE (Matching User Reference Image 2) */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Account Console
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Admin Profile
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage your credentials and security settings for the SchemeSetu administrative account
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => {
                      logoutAdmin();
                      navigate('/login');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Top Row (2 Cards): Profile Identity (Left) + Admin Security Card (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Card (Left 8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#0b1f33] text-amber-300 font-black text-xl flex items-center justify-center border-2 border-amber-400 shadow-sm shrink-0">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {currentUser?.name || 'admin'}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                          Administrator
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {currentUser?.email || 'admin@gmail.com'}
                      </p>
                    </div>
                  </div>

                  {/* 4-Column Meta Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Type</span>
                      <span className="font-bold text-slate-800">admin_root</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Region</span>
                      <span className="font-bold text-slate-800">All pan-India</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Login</span>
                      <span className="font-bold text-slate-800">Today, 07:18 AM</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Access Scope</span>
                      <span className="font-bold text-slate-800">Full privileges</span>
                    </div>
                  </div>
                </div>

                {/* Admin Access Protected Card (Right 4 cols) */}
                <div className="lg:col-span-4 bg-[#0b1f33] rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        SECURITY POSTURE
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        Admin access is protected
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium">
                    Two-factor authorization credentials active. Clean access tracking for platform security.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Two-factor security active</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Primary DB layer connected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row (2 Cards): Account Email (Left) + Recent Activity (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Account Email Card (Left 8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Account email</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Change the email address for administrative notifications and access.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Current email address
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email || 'admin@gmail.com'}
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        New email address
                      </label>
                      <input
                        type="email"
                        placeholder="Enter new email address..."
                        onClick={() => {
                          setEmailForm({
                            currentPassword: '',
                            newEmail: '',
                            confirmNewEmail: ''
                          });
                          setEmailError('');
                          setShowEmailPassword(false);
                          setEmailModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        You will be logged out after email update.
                      </span>
                      <button
                        onClick={() => {
                          setEmailForm({
                            currentPassword: '',
                            newEmail: '',
                            confirmNewEmail: ''
                          });
                          setEmailError('');
                          setShowEmailPassword(false);
                          setEmailModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Save Email
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Card (Right 4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Periodic trigger for security context</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Email verified
                      </span>
                      <span className="text-[10px] text-slate-400">14 Aug 2026, 11:20 AM</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> App data synced today
                      </span>
                      <span className="text-[10px] text-slate-400">Today, 06:40 AM</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('logs')}
                      className="text-xs font-bold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View system logs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Change Password Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 max-w-3xl">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Change password</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Ensure a strong password (minimum 8 characters) for your SchemeSetu admin account.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Current password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password..."
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: ''
                        });
                        setPasswordError('');
                        setShowCurrentPw(false);
                        setShowNewPw(false);
                        setShowConfirmPw(false);
                        setPasswordModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      New password
                    </label>
                    <input
                      type="password"
                      placeholder="At least 8 characters..."
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: ''
                        });
                        setPasswordError('');
                        setShowCurrentPw(false);
                        setShowNewPw(false);
                        setShowConfirmPw(false);
                        setPasswordModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new password..."
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: ''
                        });
                        setPasswordError('');
                        setShowCurrentPw(false);
                        setShowNewPw(false);
                        setShowConfirmPw(false);
                        setPasswordModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Password update takes effect on your next session.
                    </span>
                    <button
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: ''
                        });
                        setPasswordError('');
                        setShowCurrentPw(false);
                        setShowNewPw(false);
                        setShowConfirmPw(false);
                        setPasswordModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Change Email Modal */}
        <Modal
          isOpen={emailModalOpen}
          onClose={() => {
            if (!emailLoading) setEmailModalOpen(false);
          }}
          title="Change Administrator Email"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {emailError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{emailError}</span>
              </div>
            )}

            {/* Current Email (read only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Email
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed select-none"
              />
            </div>

            {/* New Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin.gov@domain.in"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
              />
            </div>

            {/* Confirm New Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Re-enter new email address"
                value={emailForm.confirmNewEmail}
                onChange={(e) => setEmailForm({ ...emailForm, confirmNewEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
              />
            </div>

            {/* Current Password for verification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password (Identity Verification) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showEmailPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Required to confirm you are the authorized account administrator.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={emailLoading}
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={emailLoading}
                className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#163857] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {emailLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => {
            if (!passwordLoading) setPasswordModalOpen(false);
          }}
          title="Change Administrator Password"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">Password Requirements:</span>
              <ul className="text-[10px] text-slate-500 space-y-0.5 list-disc list-inside">
                <li>Must contain at least 6 characters.</li>
                <li>Must differ from your current password.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={passwordLoading}
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#163857] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {passwordLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* View Scheme Audit Details Modal */}
        <SchemeViewModal
          isOpen={viewSchemeModalOpen}
          onClose={() => setViewSchemeModalOpen(false)}
          scheme={viewSchemeData}
          onEdit={
            viewSchemeFromRecent
              ? null
              : (schemeToEdit) => {
                setSelectedScheme(schemeToEdit);
                setSchemeModalOpen(true);
              }
          }
        />

        {/* Scheme Form Modal (Create or Edit) */}
        <SchemeModal
          isOpen={schemeModalOpen}
          onClose={() => { setSchemeModalOpen(false); setSelectedScheme(null); }}
          onSave={handleSaveScheme}
          scheme={selectedScheme}
          loading={submitting}
        />

        {/* User Form Modal (Edit User Profile) */}
        <UserEditModal
          isOpen={userModalOpen}
          onClose={() => { setUserModalOpen(false); setSelectedUser(null); }}
          onSave={handleSaveUser}
          user={selectedUser}
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
      </div>
    </div>
  );
};
