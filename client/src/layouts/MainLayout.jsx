import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/Toast';

export const MainLayout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/register';
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer is hidden on authentication pages */}
      {!hideFooter && <Footer />}
      <ToastContainer />
    </div>
  );
};
