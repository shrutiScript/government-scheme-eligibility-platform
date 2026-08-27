import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { AuthHeader } from './components/AuthHeader';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityPage } from './pages/EligibilityPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { YourSchemesPage } from './pages/YourSchemesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BlockedPage } from './pages/BlockedPage';

/**
 * Admin Protected Route
 * Strictly ensures only authenticated Administrators can access Admin routes (/admin).
 * Redirects unauthenticated users to /login.
 */
const AdminProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const adminToken =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('gov_admin_token') || localStorage.getItem('gov_admin_token')
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-900 text-white">
        Loading Admin Console...
      </div>
    );
  }

  if (!isAdmin && !adminToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Citizen Protected Route
 * Accessible strictly by authenticated Citizens.
 * - Redirects Admins to /admin.
 * - Redirects Blocked Citizens to /blocked.
 * - Redirects unauthenticated guests to /login.
 */
const CitizenProtectedRoute = ({ children }) => {
  const { isCitizenAuthenticated, citizenUser, isAdmin, loading } = useAuth();
  const adminToken =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('gov_admin_token') || localStorage.getItem('gov_admin_token')
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Loading...
      </div>
    );
  }

  if (isAdmin || Boolean(adminToken)) {
    return <Navigate to="/admin" replace />;
  }

  if (citizenUser?.isBlocked) {
    return <Navigate to="/blocked" replace />;
  }

  if (!isCitizenAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Auth Layout Wrapper
 * Strictly renders public unauthenticated AuthHeader on /login and /register.
 * Guarantees that authenticated Client navigation and profile dropdowns NEVER appear.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased">
      <AuthHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

/**
 * Citizen Layout Wrapper
 * Renders Client Header, Content, and Footer for authenticated citizens.
 * (Header and Footer are hidden on blocked route).
 */
const ClientLayout = ({ children }) => {
  const location = useLocation();
  const isBlockedRoute = location.pathname === '/blocked';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {!isBlockedRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isBlockedRoute && <Footer />}
      <ToastContainer />
    </div>
  );
};

/**
 * Admin Layout Wrapper
 * Renders dedicated Admin container with ToastContainer.
 */
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</main>
      <ToastContainer />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* ====================================================== */}
            {/* ADMIN ROUTES (Strictly Protected for Admin Only)       */}
            {/* ====================================================== */}
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />

            {/* ====================================================== */}
            {/* PUBLIC AUTHENTICATION ROUTES (Dedicated Auth Layout)   */}
            {/* ====================================================== */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              }
            />
            <Route
              path="/blocked"
              element={
                <ClientLayout>
                  <BlockedPage />
                </ClientLayout>
              }
            />

            {/* ====================================================== */}
            {/* PUBLIC & BROWSING ROUTES (Website Home & Catalog)      */}
            {/* ====================================================== */}
            <Route
              path="/"
              element={
                <ClientLayout>
                  <HomePage />
                </ClientLayout>
              }
            />
            <Route
              path="/home"
              element={
                <ClientLayout>
                  <HomePage />
                </ClientLayout>
              }
            />
            <Route
              path="/schemes"
              element={
                <ClientLayout>
                  <SchemesPage />
                </ClientLayout>
              }
            />
            <Route
              path="/browse-schemes"
              element={
                <ClientLayout>
                  <SchemesPage />
                </ClientLayout>
              }
            />
            <Route
              path="/schemes/:id"
              element={
                <ClientLayout>
                  <SchemeDetailPage />
                </ClientLayout>
              }
            />

            {/* ====================================================== */}
            {/* CITIZEN PROTECTED ROUTES (Requires Login Credentials)  */}
            {/* ====================================================== */}
            <Route
              path="/dashboard"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <DashboardPage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <ProfilePage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />
            <Route
              path="/your-schemes"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <YourSchemesPage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />
            <Route
              path="/saved-schemes"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <YourSchemesPage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />
            <Route
              path="/eligibility"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <EligibilityPage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <CitizenProtectedRoute>
                  <ClientLayout>
                    <EligibilityPage />
                  </ClientLayout>
                </CitizenProtectedRoute>
              }
            />

            {/* ====================================================== */}
            {/* CATCH-ALL ROUTE                                       */}
            {/* ====================================================== */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
