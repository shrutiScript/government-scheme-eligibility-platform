import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminHeader } from '../components/AdminHeader';
import { ToastContainer } from '../components/Toast';

export const AdminLayout = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col bg-slate-100" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Sticky Top Navbar — always visible, never scrolls away */}
      <AdminHeader />

      {/* Body — sidebar + page content, fills remaining height, min-h-0 required for flex scroll */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>

      <ToastContainer />
    </div>
  );
};
