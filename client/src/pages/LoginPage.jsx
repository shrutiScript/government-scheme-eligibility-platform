import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
<<<<<<< HEAD
import { Loader2 } from 'lucide-react';
import { PageMotionWrapper } from '../components/PageMotionWrapper';

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  // Auto-fill registered email if coming from registration (password remains empty)
  const registeredEmail = location.state?.registeredEmail || '';
  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !email.includes('@')) {
      notifyError('Invalid Email');
      return;
    }
    if (!password) {
      notifyError('Incorrect Password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        notifySuccess('Login Successful');
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const msg = res.message || 'Login failed';
        if (msg.toLowerCase().includes('password')) {
          notifyError('Incorrect Password');
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user')) {
          notifyError('Invalid Email');
        } else {
          notifyError(msg);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || '';
      if (msg.toLowerCase().includes('password')) {
        notifyError('Incorrect Password');
      } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user')) {
        notifyError('Invalid Email');
      } else {
        notifyError('Server Error. Please try again later.');
      }
=======
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
>>>>>>> second-copy
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <PageMotionWrapper className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        {/* Toggle Pill Bar (Sign in | Register) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-xs font-bold text-slate-900 bg-white rounded-xl shadow-xs border border-slate-200 transition-all"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-all"
          >
            Register
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to view your eligible schemes.
          </p>
        </div>

        {/* Quick Admin Credentials Fill Box */}
        {/* <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-900 block">Admin Credentials</span>
            <span className="text-amber-700 font-mono text-[11px]">admin@gmail.com / admin@123</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@gmail.com');
              setPassword('admin@123');
            }}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs transition-all cursor-pointer text-[11px]"
          >
            Auto-fill
          </button>
        </div> */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] focus:border-transparent outline-none transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0f2942] focus:border-transparent outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0f2942] focus:ring-[#0f2942] cursor-pointer"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => notifyError('Please contact administrator for password recovery.')}
              className="font-bold text-[#0f2942] hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Solid Navy Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0f2942] hover:bg-[#0c2338] text-white font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
=======
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
>>>>>>> second-copy
      </div>
    </PageMotionWrapper>
  );
};
<<<<<<< HEAD
=======

export default LoginPage;
>>>>>>> second-copy
