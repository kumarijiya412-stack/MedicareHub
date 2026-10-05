import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Heart,
  Users,
  Pill,
  Calendar,
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode,
  Zap,
  TrendingDown,
  ChevronRight,
  Dna,
  FlaskConical,
  FolderLock,
  UserCheck,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-12">
      {/* 1. HERO SECTION WITH REALISTIC EDITORIAL FAMILY HEALTHCARE IMAGE */}
      <section className="pt-8 sm:pt-14 pb-12 relative">
        {/* Subtle Warm Rose Accent Light Shape behind Hero Visual */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-warmrose-100/50 dark:bg-warmrose-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>Personal & Family Health Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white font-['Poppins'] tracking-tight leading-tight">
                Manage your and your family's health in one secure place.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                MediCare Hub organizes personal medical records, tracks symptoms with specialist triage, monitors hereditary health risks, reminds you of preventive tests, and compares medicine prices across accredited pharmacies.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2.5 sm:space-y-0 sm:space-x-3 pt-1">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-2xs"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-2xs"
                    >
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                    >
                      <span>Sign In with Demo Account</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Verified Patient ID</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>256-Bit Encrypted Records</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  <TrendingDown className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  <span>Multi-Seller Price Comparison</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Realistic Editorial Photograph with Subtle Warm Rose Highlight Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg">
                {/* Subtle Muted Rose Accent Border Frame */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-warmrose-300/40 via-transparent to-primary-300/30 dark:from-warmrose-900/30 dark:to-primary-900/20 blur-xs" />

                <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/images/hero_family_wellness.jpg"
                      alt="Multi-generational family sharing a peaceful, healthy morning at home"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />

                    {/* Clean Overlay Card: Patient Greeting Preview */}
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Family Health Profile</span>
                        <span className="text-teal-700 dark:text-teal-400 font-semibold text-[11px] flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block mr-1.5" />
                          Active Record
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Hey, what's up</p>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alex Morgan & Family</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center space-x-1">
                            <span>Hope you're doing fine</span>
                            <Heart className="w-3 h-3 text-warmrose-500 fill-warmrose-500 inline-block shrink-0" />
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>MCH-VERIFIED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 9 ESSENTIAL HEALTH MODULES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1.5">Platform Features</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Poppins'] tracking-tight">
            Integrated health tools for daily care and prevention
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Organized into nine focused modules for medical records, symptom tracking, hereditary risk assessment, and medicine management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Medical History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Consolidated registry of chronic conditions, past surgeries, verified drug allergies, and current daily medications with dosage reminders.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Symptoms Tracker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Log severity, duration, and triggers on a chronological timeline. Receives guidance on relevant specialist doctor types (with non-diagnosis disclaimer).
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                <Dna className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Family Genetic Risk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Map hereditary conditions across parents and siblings. Automated risk analysis highlights early screening advice for heart disease and diabetes.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Recommended Tests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Age and medical profile-based preventive screening schedules (HbA1c, Lipid profile, CBC). Toggle Due and Done with quarterly reminders.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Doctor Consultations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Book consultations, select convenient time slots, reschedule or cancel visits with ease. Never miss an appointment with timely reminders.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-warmrose-50 dark:bg-warmrose-950/60 border border-warmrose-100 dark:border-warmrose-900/60 flex items-center justify-center text-warmrose-600 dark:text-warmrose-400 mb-3">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Medical Reports Vault</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Securely upload and categorize blood test PDFs, X-ray scans, and discharge summaries. Instant in-browser preview and 1-click download.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Verified Patient ID</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A unique digital health identity card equipped with an authentic QR code, verified badge, and critical emergency medical contacts.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Find Doctors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Search verified cardiologists, dermatologists, and pediatricians by city, rating, and fee. Intelligent suggestions based on your logged symptoms.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-1">Medicine Store & Pricing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare live rates across Apollo, Tata 1mg, Netmeds, and PharmEasy. Automatically highlights the lowest price seller and verifies batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1.5">Workflow</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Poppins']">
              How MediCare Hub Works
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-7 h-7 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-600 mb-2.5">
                01
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Add Family Members</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create dedicated health profiles for your spouse, children, or elderly parents under a single account.
              </p>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-7 h-7 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-600 mb-2.5">
                02
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Log Health & Symptoms</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Record allergies, past conditions, and ongoing symptoms to receive clinical specialist guidance.
              </p>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-7 h-7 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-600 mb-2.5">
                03
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Track Preventive Tests</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Follow personalized annual screening timelines to catch potential health risks early.
              </p>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-7 h-7 rounded bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-600 mb-2.5">
                04
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Save on Care & Meds</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare multi-seller medicine prices, upload prescriptions, and book top-rated doctors directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & SECURITY */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Data Protection & Clinical Privacy</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Poppins'] tracking-tight">
              Patient privacy and security built-in
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Health records represent your most sensitive personal information. MediCare Hub adheres strictly to healthcare security standards:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Role-Isolated Privacy:</strong> Users only access records belonging to themselves or their verified linked family profiles.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Encrypted JWT & Hash Security:</strong> Passwords hashed with bcrypt; authentication secured via hardened httpOnly cookies.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Regulatory Preparedness:</strong> Structured to comply with India's Digital Personal Data Protection (DPDP) Act 2023, HIPAA, and GDPR principles.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Full Data Portability:</strong> 1-click JSON health data export and permanent account deletion options.</span>
              </li>
            </ul>

            <Link
              to="/legal-privacy"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 pt-1"
            >
              <span>View complete compliance documentation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Poppins'] mb-3 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Security & Regulatory Framework</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">DPDP Act (India) 2023</p>
                    <p className="text-slate-500 dark:text-slate-400">Explicit consent, purpose limitation, and user rights</p>
                  </div>
                  <span className="font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 text-[10px]">
                    Compliant
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">HIPAA Security Safeguards</p>
                    <p className="text-slate-500 dark:text-slate-400">Encrypted transport, audit logs, and access control</p>
                  </div>
                  <span className="font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 text-[10px]">
                    Aligned
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Licensed Pharmacy Verification</p>
                    <p className="text-slate-500 dark:text-slate-400">CDSCO / WHO-GMP certified batch & license tracking</p>
                  </div>
                  <span className="font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 text-[10px]">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 sm:p-10 text-white text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] tracking-tight">
              Get started with MediCare Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Consolidate your family's health records, schedule preventive screenings, and compare prescription medicine prices.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                Create Free Account
              </Link>
              <Link
                to="/medicine-store"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Browse Medicine Store
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
