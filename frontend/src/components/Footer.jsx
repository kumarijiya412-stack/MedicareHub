import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 pt-10 pb-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Notice Banner */}
        <div className="mb-8 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40 flex items-start space-x-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-950 dark:text-amber-100">Medical Emergency Notice:</span> MediCare Hub is a health tracking companion and does not provide emergency clinical intervention. If you are experiencing chest pain, sudden breathlessness, or an acute emergency, please contact local emergency services immediately (911 in US / 112 in India).
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                MediCare <span className="text-primary-600 dark:text-primary-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Comprehensive personal and family health companion. Track clinical records, hereditary risks, appointments, and certified medicine deliveries in one secure place.
            </p>
            <div className="flex items-center space-x-1.5 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/40 w-max">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Verified Health Portal</span>
            </div>
          </div>

          {/* Quick Health Sections */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Health Tracking</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/medical-history" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Medical History</Link></li>
              <li><Link to="/symptoms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Symptoms Tracker</Link></li>
              <li><Link to="/family-genetic" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Family Genetic Risk</Link></li>
              <li><Link to="/recommended-tests" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Recommended Tests</Link></li>
              <li><Link to="/patient-id" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Verified Patient ID</Link></li>
            </ul>
          </div>

          {/* Clinical & Store Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Care & Pharmacy</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/find-doctors" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Find Specialists</Link></li>
              <li><Link to="/appointments" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Doctor Check-ups</Link></li>
              <li><Link to="/medicine-store" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Medicine Store & Compare</Link></li>
              <li><Link to="/medical-reports" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Secure Medical Reports</Link></li>
              <li><Link to="/profile" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Family Profiles</Link></li>
            </ul>
          </div>

          {/* Privacy & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Privacy & Trust</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/legal-privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy & DPDP Act</Link></li>
              <li><Link to="/legal-privacy#hipaa" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">HIPAA & GDPR Standards</Link></li>
              <li><Link to="/legal-privacy#pharmacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Licensed Pharmacy Partners</Link></li>
              <li><Link to="/legal-privacy#terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
            </ul>
            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>256-bit encrypted data at rest</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} MediCare Hub. Patient health records portal.</p>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <Link to="/legal-privacy" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/legal-privacy" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Terms of Use</Link>
            <span>•</span>
            <Link to="/legal-privacy" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
