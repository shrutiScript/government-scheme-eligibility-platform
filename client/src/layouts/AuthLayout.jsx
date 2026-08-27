import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';
import { Header } from '../components/Header';

// Focused authentication layout — Header only, no Footer.
export const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
};
