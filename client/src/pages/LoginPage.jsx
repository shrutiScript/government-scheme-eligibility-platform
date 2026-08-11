import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
      </div>
    </PageMotionWrapper>
  );
};
