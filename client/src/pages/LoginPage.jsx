import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const isBlockedRedirect = new URLSearchParams(location.search).get('blocked') === '1';

  useEffect(() => {
    if (isBlockedRedirect) {
      setError('Your account has been blocked. Please contact the administrator.');
      notifyWarning('Your account has been suspended by the administrator.');
    }
  }, [isBlockedRedirect, notifyWarning]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login({ email, password });
      notifySuccess('Login successful');

      if (res?.user?.role === 'admin' || email.toLowerCase().includes('admin')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotionWrapper>
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-[#f8fafc]">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 space-y-6">
          {/* Top Segment Switcher (Matching Screenshot 2) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 text-xs font-bold text-slate-600">
            <button
              type="button"
              className="flex-1 py-2 rounded-xl bg-white text-slate-900 shadow-sm text-center font-bold"
            >
              Sign in
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 text-center text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              Register
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-xs text-slate-400 font-medium">
              Sign in to view your eligible schemes.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0c2338] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0c2338] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0c2338] focus:ring-[#0c2338] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-slate-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0c2338] hover:bg-[#071928] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <span>Signing in...</span> : <span>Sign in</span>}
            </button>
          </form>
        </div>
      </div>
    </PageMotionWrapper>
  );
};

export default LoginPage;
