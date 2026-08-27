import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { PageMotionWrapper } from '../components/PageMotionWrapper';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim()) {
      notifyError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      notifyError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      notifyError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, password, role });
      if (res.success) {
        notifySuccess('Registration Successful');
        // Redirect to Login Page with email pre-filled (No password autofill)
        navigate('/login', { state: { registeredEmail: email } });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Registration failed. User already exists.';
      notifyError(errMsg.includes('exists') ? 'User Already Exists' : errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotionWrapper className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        {/* Toggle Pill Bar (Sign in | Register) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-all"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 text-center text-xs font-bold text-slate-900 bg-white rounded-xl shadow-xs border border-slate-200 transition-all"
          >
            Register
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create account
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Register to view eligible schemes and track entitlements.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password (Min 6 characters) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] outline-none disabled:opacity-60"
            >
              <option value="user">Citizen / User</option>
              <option value="admin">System Admin</option>
            </select>
          </div> */}

          {/* Solid Navy Register Button with Spinner */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0f2942] hover:bg-[#0c2338] text-white font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>
    </PageMotionWrapper>
  );
};
