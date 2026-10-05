import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Heart,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound
} from 'lucide-react';

export default function SignupPage() {
  const { signup, verifyOtp, resendOtp, toast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // If redirected from login because unverified
  useEffect(() => {
    if (location.state?.email && location.state?.requiresVerification) {
      setOtpEmail(location.state.email);
      setOtpModalOpen(true);
    }
  }, [location.state]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';

  if (score >= 5) {
    strengthLabel = 'Very Strong';
    strengthColor = 'bg-emerald-500';
  } else if (score >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-400';
  } else if (score >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-400';
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (score < 5) {
      setError('Please ensure your password fulfills all 5 security criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!consent) {
      setError('Please agree to the health data processing Terms & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        full_name: fullName,
        email,
        phone,
        date_of_birth: dob,
        password,
        confirm_password: confirmPassword,
        consent
      });

      setOtpEmail(email);
      setOtpModalOpen(true);
      setResendCooldown(45);

      if (res.devOtp) {
        setOtpCode(res.devOtp);
        toast.info(`Development Mock OTP received: ${res.devOtp}`);
      } else {
        toast.success('Registration initiated. Verification code sent!');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(otpEmail, otpCode);
      setOtpModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await resendOtp(otpEmail);
      setResendCooldown(60);
      if (res.devOtp) {
        setOtpCode(res.devOtp);
        toast.info(`New Development Mock OTP: ${res.devOtp}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 items-center justify-center text-primary-600 mb-3">
            <Heart className="w-5 h-5 fill-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Poppins'] tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage personal and family healthcare in one portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-500">Strength:</span>
                  <span className={score >= 4 ? 'text-emerald-700' : score >= 3 ? 'text-amber-700' : 'text-rose-700'}>
                    {strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex space-x-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full flex-1 rounded-full transition-all ${
                        score >= lvl ? strengthColor : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* 5 Rules Checklist */}
                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1">
                    {rules.length ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />}
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {rules.upper ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {rules.lower ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {rules.number ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className="flex items-center space-x-1 col-span-2">
                    {rules.special ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />}
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-9 pr-9 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              />
              {confirmPassword.length > 0 && (
                <div className="absolute right-3 top-2.5">
                  {passwordsMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-rose-600 mt-1">Passwords do not match.</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              <span className="leading-tight">
                I give consent for processing personal health records in accordance with the{' '}
                <Link to="/legal-privacy" target="_blank" className="text-primary-600 font-semibold underline">
                  Privacy Policy
                </Link>{' '}
                and Terms of Service.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Register & Verify Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </div>
      </div>

      {/* 6-Digit Email OTP Verification Modal */}
      <Modal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title="Verify Email Address"
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-700">
            <KeyRound className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Verification Code Dispatched</p>
              <p className="text-slate-500 mt-0.5">
                We've sent a 6-digit code to <span className="font-semibold text-slate-800">{otpEmail}</span>. Enter it below to activate your account.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
              Enter 6-Digit OTP
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-center text-xl font-mono font-bold tracking-[0.4em] text-slate-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={otpLoading || otpCode.length < 6}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 shadow-2xs disabled:opacity-50 transition-colors"
          >
            {otpLoading ? 'Verifying...' : 'Confirm & Open Dashboard'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-xs font-semibold text-slate-500 hover:text-primary-600 disabled:opacity-50 flex items-center justify-center space-x-1.5 mx-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
