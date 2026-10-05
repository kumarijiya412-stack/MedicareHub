import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Lock, Mail, Eye, EyeOff, Heart, ArrowRight, ShieldCheck, KeyRound, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, toast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter code & new pass
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.data?.requiresVerification) {
        // Redirect to OTP verification screen
        navigate('/signup', { state: { email: err.data.email, requiresVerification: true } });
        toast.info('Please verify your email with the 6-digit code before signing in.');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('alex@medicare.com');
    setPassword('Password123!');
    setLoading(true);
    setError('');
    try {
      await login('alex@medicare.com', 'Password123!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your account email.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.message);
      if (res.devResetCode) {
        setResetCode(res.devResetCode);
        toast.info(`Development test reset code: ${res.devResetCode}`);
      }
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmNewPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        reset_code: resetCode,
        new_password: newPassword,
        confirm_password: confirmNewPassword
      });
      toast.success(res.message);
      setForgotModalOpen(false);
      setForgotStep(1);
      setEmail(forgotEmail);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 items-center justify-center text-primary-600 mb-3">
            <Heart className="w-5 h-5 fill-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Poppins'] tracking-tight">
            Sign In to MediCare Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your personal and family health records
          </p>
        </div>

        {/* Quick Demo Fill Button */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span>Quick Demo Login (Alex Morgan)</span>
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotEmail(email);
                }}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-1 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={forgotStep === 1 ? 'Reset Your Password' : 'Enter 6-Digit Reset Code'}
      >
        {forgotStep === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-xs text-slate-500">
              Enter your registered email address. We will send you a 6-digit password recovery code.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-60"
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-slate-500">{forgotMsg}</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-center font-mono tracking-widest text-lg font-bold outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (8+ chars, upper, lower, symbol)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-60"
            >
              {forgotLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
