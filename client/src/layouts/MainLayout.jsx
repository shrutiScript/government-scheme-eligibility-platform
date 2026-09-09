import React from 'react';
<<<<<<< HEAD
import { Outlet } from 'react-router-dom';
=======
import { Outlet, useLocation } from 'react-router-dom';
>>>>>>> second-copy
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/Toast';

export const MainLayout = () => {
<<<<<<< HEAD
=======
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/register';
>>>>>>> second-copy
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
<<<<<<< HEAD
      <Footer />
=======
      {/* Footer is hidden on authentication pages */}
      {!hideFooter && <Footer />}
>>>>>>> second-copy
      <ToastContainer />
    </div>
  );
};
