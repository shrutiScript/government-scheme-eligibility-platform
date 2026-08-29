import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Copy
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  // Step 1: 'request_otp', Step 2: 'enter_new_password', Step 3: 'success'
  const [step, setStep] = useState('request_otp');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  // Resend cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Success auto-redirect effect
  useEffect(() => {
    let timer;
    if (step === 'success') {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, navigate]);

  // Field validation
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email': {
        const clean = typeof value === 'string' ? value.trim() : '';
        if (!clean) {
          error = 'Please enter your registered email address.';
        } else if (!/^\S+@\S+\.\S+$/.test(clean)) {
          error = 'Please enter a valid email address.';
        }
        break;
      }
      case 'otp': {
        const clean = typeof value === 'string' ? value.trim() : '';
        if (!clean) {
          error = 'Please enter the 6-digit verification code.';
        } else if (!/^\d{6}$/.test(clean)) {
          error = 'Verification code must contain exactly 6 digits.';
        }
        break;
      }
      case 'newPassword': {
        if (!value) {
          error = 'New password is required.';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters.';
        }
        break;
      }
      case 'confirmPassword': {
        if (!value) {
          error = 'Please confirm your new password.';
        } else if (value !== newPassword) {
          error = 'Passwords do not match.';
        }
        break;
      }
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    let sanitized = value;
    if (field === 'otp') {
      sanitized = value.replace(/\D/g, '').slice(0, 6);
    }

    if (field === 'email') setEmail(sanitized);
    if (field === 'otp') setOtp(sanitized);
    if (field === 'newPassword') setNewPassword(sanitized);
    if (field === 'confirmPassword') setConfirmPassword(sanitized);

    // Dynamic error clearing
    if (touched[field] || errors[field]) {
      const err = validateField(field, sanitized);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[field] = err;
        } else {
          delete next[field];
        }
        if (field === 'newPassword' && confirmPassword) {
          if (confirmPassword === sanitized) {
            delete next.confirmPassword;
          } else {
            next.confirmPassword = 'Passwords do not match.';
          }
        }
        return next;
      });
    }
  };

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[field] = err;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  // Step 1: Submit email to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (loading) return;

    setTouched((prev) => ({ ...prev, email: true }));
    const emailErr = validateField('email', email);
    if (emailErr) {
      setErrors((prev) => ({ ...prev, email: emailErr }));
      notifyError(emailErr);
      const el = document.querySelector('[name="email"]');
      if (el) el.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      const data = res?.data || res;
      if (data.success || data.message) {
        const code = data.otp || '';
        setGeneratedOtp(code);
        if (code) {
          setOtp(code); // Pre-fill directly on screen as requested!
        }
        notifySuccess(data.message || 'Verification code sent successfully.');
        setStep('enter_new_password');
        setResendCooldown(60);
        setErrors({});
        setTouched({});
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Please enter a valid registered email address.';
      setErrors((prev) => ({ ...prev, email: errMsg }));
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resending || resendCooldown > 0) return;

    setResending(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      const data = res?.data || res;
      if (data.success || data.message) {
        const code = data.otp || '';
        setGeneratedOtp(code);
        if (code) setOtp(code);
        notifySuccess('A fresh verification code has been generated.');
        setResendCooldown(60);
        setErrors({});
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to generate verification code.';
      notifyError(errMsg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Submit OTP & New Password to complete reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const newErrors = {};
    const otpErr = validateField('otp', otp);
    if (otpErr) newErrors.otp = otpErr;

    const pwErr = validateField('newPassword', newPassword);
    if (pwErr) newErrors.newPassword = pwErr;

    const confirmErr = validateField('confirmPassword', confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ otp: true, newPassword: true, confirmPassword: true });
      const firstKey = ['otp', 'newPassword', 'confirmPassword'].find((k) => newErrors[k]);
      if (firstKey) {
        notifyError(newErrors[firstKey]);
        const el = document.querySelector(`[name="${firstKey}"]`);
        if (el) el.focus();
      }
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });

      const data = res?.data || res;
      if (data.success || data.message) {
        notifySuccess('Password reset successfully.');
        setStep('success');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to reset password.';
      notifyError(errMsg);
      if (errMsg.toLowerCase().includes('code') || errMsg.toLowerCase().includes('otp')) {
        setErrors((prev) => ({ ...prev, otp: errMsg }));
      } else {
        setErrors((prev) => ({ ...prev, newPassword: errMsg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-2.5 rounded-xl border text-xs font-medium text-slate-800 outline-none transition-all disabled:opacity-60 ${
      hasError
        ? 'border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500'
        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:ring-1 focus:ring-[#0c2338]'
    }`;
  };

  return (
    <PageMotionWrapper>
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-[#f8fafc]">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 space-y-6">
          
          {/* Top Brand & Icon Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0c2338] text-amber-400 flex items-center justify-center shadow-lg shadow-slate-900/10">
              {step === 'success' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-fade-in" />
              ) : (
                <KeyRound className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {step === 'success'
                  ? 'Password Reset Successfully'
                  : 'Forgot Password?'}
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[340px] mx-auto">
                {step === 'request_otp' &&
                  'Enter your registered email address to reset your password.'}
                {step === 'enter_new_password' &&
                  `Enter the 6-digit verification code and set your new password.`}
                {step === 'success' &&
                  'Your password has been updated. You can now sign in with your new credentials.'}
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* STEP 1: REQUEST OTP FORM                                          */}
          {/* ================================================================= */}
          {step === 'request_otp' && (
            <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className={`${getFieldClass('email')} pl-10`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0c2338] hover:bg-[#071928] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ENTER OTP & NEW PASSWORD FORM                             */}
          {/* ================================================================= */}
          {step === 'enter_new_password' && (
            <form onSubmit={handleResetPasswordSubmit} noValidate className="space-y-4">
              {/* Email Summary Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('request_otp');
                    setErrors({});
                  }}
                  className="text-xs font-bold text-[#0c2338] hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Change
                </button>
              </div>

              {/* Highlighted On-Screen Verification Code Card */}
              {generatedOtp && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-slate-800 space-y-1.5 animate-card-enter">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Verification Code
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(generatedOtp);
                        notifySuccess('Verification code copied to field!');
                      }}
                      className="text-[11px] font-bold text-[#0c2338] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Auto-fill</span>
                    </button>
                  </div>
                  <div className="text-2xl font-black tracking-widest text-[#0c2338] font-mono select-all text-center py-1 bg-white/80 rounded-xl border border-amber-100 shadow-xs">
                    {generatedOtp}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium text-center">
                    Valid for 10 minutes. Enter this 6-digit code below.
                  </p>
                </div>
              )}

              {/* OTP Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    6-Digit Verification Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || resendCooldown > 0}
                    className="text-[11px] font-bold text-[#0c2338] hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <span>Resend in {resendCooldown}s</span>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Code</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  name="otp"
                  value={otp}
                  onChange={(e) => handleInputChange('otp', e.target.value)}
                  onBlur={(e) => handleBlur('otp', e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  disabled={loading}
                  className={`${getFieldClass('otp')} text-center tracking-widest text-base font-bold font-mono`}
                />
                {errors.otp && touched.otp && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.otp}</span>
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  New Password (min 8 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    onBlur={(e) => handleBlur('newPassword', e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`${getFieldClass('newPassword')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.newPassword}</span>
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`${getFieldClass('confirmPassword')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0c2338] hover:bg-[#071928] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 3: SUCCESS STATE                                             */}
          {/* ================================================================= */}
          {step === 'success' && (
            <div className="space-y-6 text-center animate-fade-in py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Password reset successfully. You will be redirected to the Sign In page in {redirectCountdown} seconds.
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3 rounded-xl bg-[#0c2338] hover:bg-[#071928] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </PageMotionWrapper>
  );
};

export default ForgotPasswordPage;
