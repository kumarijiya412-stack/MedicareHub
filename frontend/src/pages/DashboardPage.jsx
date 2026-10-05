import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthOverviewStrip from '../components/HealthOverviewStrip';
import SectionCard from '../components/SectionCard';
import {
  ShieldCheck,
  Heart,
  User,
  Users,
  Sparkles,
  AlertCircle,
  FileText,
  Activity,
  Dna,
  FlaskConical,
  Calendar,
  FolderLock,
  UserCheck,
  Pill,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, activeMember, setActiveMember, patientCard } = useAuth();

  const displayName = activeMember ? activeMember.full_name : user?.full_name || 'Friend';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Active Family Member Context Banner (if viewing family member) */}
      {activeMember && (
        <div className="bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/40 rounded-lg p-3.5 flex items-center justify-between text-xs sm:text-sm transition-colors">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Viewing records for:{' '}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{activeMember.full_name}</strong> ({activeMember.relation})
            </span>
          </div>
          <button
            onClick={() => setActiveMember(null)}
            className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
          >
            Switch to Myself
          </button>
        </div>
      )}

      {/* TOP GREETING CARD (Exact User Prompt Specification) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-2xs relative transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Patient Health Dashboard</span>
              <span>•</span>
              <span className="text-teal-700 dark:text-teal-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block mr-1.5" />
                Active Record
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-1">
              Hey, what's up
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              {displayName}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center space-x-1.5">
              <span>Hope you're doing fine</span>
              <Heart className="w-3.5 h-3.5 text-warmrose-500 fill-warmrose-500 inline-block shrink-0" />
            </p>
          </div>

          {/* Patient Card Quick Access */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
            <Link
              to="/patient-id"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Patient ID: {patientCard?.patient_id_number || 'MCH-VERIFIED'}</span>
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Blood Group: {user?.blood_group || 'O+'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* HEALTH OVERVIEW STRIP (Upcoming Appointments, Tests Due, Recent Reports) */}
      <HealthOverviewStrip />

      {/* Subtle Warm Rose Callout: Empathy & Preventive Care */}
      <div className="bg-warmrose-50/50 dark:bg-warmrose-950/20 rounded-xl p-4 sm:p-5 border border-warmrose-200/60 dark:border-warmrose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-warmrose-100 dark:bg-warmrose-900/50 text-warmrose-600 dark:text-warmrose-300 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-4 h-4 fill-warmrose-500/20" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-warmrose-900 dark:text-warmrose-200 uppercase tracking-wider">
              Preventive Care Routine
            </h3>
            <p className="text-xs text-warmrose-800/90 dark:text-warmrose-300 mt-0.5 leading-relaxed">
              Taking preventive care early can help you stay ahead. Regular metabolic and cardiovascular screenings are the most compassionate investment in your family's future.
            </p>
          </div>
        </div>
        <Link
          to="/recommended-tests"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-warmrose-50 dark:hover:bg-slate-700 text-warmrose-700 dark:text-warmrose-300 text-xs font-semibold border border-warmrose-200 dark:border-warmrose-800 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <span>View Checks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 9 CORE HEALTH MODULES */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Health Dashboard Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any section to manage clinical records, appointments, and care
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Medical History */}
          <SectionCard
            to="/medical-history"
            icon={FileText}
            iconColor="text-primary-600 dark:text-primary-400"
            iconBg="bg-primary-50 dark:bg-primary-950/60 border-primary-100 dark:border-primary-900/60"
            title="Medical History"
            subtitle="Track past and ongoing conditions, surgeries, medication doses, and drug allergies."
            badgeText="Clinical Records"
            tagline="Allergies, surgeries & medications"
          />

          {/* 2. Symptoms Tracker */}
          <SectionCard
            to="/symptoms"
            icon={Activity}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/60"
            title="Symptoms Tracker"
            subtitle="Log symptoms with severity & duration. Get specialist doctor recommendations on an interactive timeline."
            badgeText="Specialist Triage"
            tagline="Timeline & specialist guidance"
          />

          {/* 3. Family Medical History */}
          <SectionCard
            to="/family-genetic"
            icon={Dna}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900/60"
            title="Family Medical History"
            subtitle="Explore possible hereditary risks for diabetes, hypertension, and heart disease with clinical guidance."
            badgeText="Hereditary Risk"
            tagline="Genetic predisposition insights"
          />

          {/* 4. Recommended Tests */}
          <SectionCard
            to="/recommended-tests"
            icon={FlaskConical}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBg="bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-900/60"
            title="Recommended Tests"
            subtitle="Age & profile-based preventive screening suggestions (HbA1c, Lipids, CBC) with Due/Done status."
            badgeText="Preventive Care"
            tagline="Track due tests & reminders"
          />

          {/* 5. Doctor Check-ups */}
          <SectionCard
            to="/appointments"
            icon={Calendar}
            iconColor="text-sky-600 dark:text-sky-400"
            iconBg="bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-900/60"
            title="Doctor Check-ups"
            subtitle="Book consultations with top hospital specialists, manage time slots, and reschedule visits."
            badgeText="Visits & Slots"
            tagline="Appointment calendar & reminders"
          />

          {/* 6. Medical Reports */}
          <SectionCard
            to="/medical-reports"
            icon={FolderLock}
            iconColor="text-warmrose-600 dark:text-warmrose-400"
            iconBg="bg-warmrose-50 dark:bg-warmrose-950/60 border-warmrose-100 dark:border-warmrose-900/60"
            title="Medical Reports Vault"
            subtitle="Upload and organize lab PDF tests, X-rays, and prescriptions. In-browser preview and download."
            badgeText="Secure Cloud"
            tagline="PDF & image encrypted storage"
          />

          {/* 7. Verified Patient ID */}
          <SectionCard
            to="/patient-id"
            icon={ShieldCheck}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBg="bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-900/60"
            title="Verified Patient ID"
            subtitle="Digital health identity card with secure QR code, verified badge, and emergency contact details."
            badgeText="Official Card"
            tagline="Scan-ready digital health card"
          />

          {/* 8. Find Doctors */}
          <SectionCard
            to="/find-doctors"
            icon={UserCheck}
            iconColor="text-primary-600 dark:text-primary-400"
            iconBg="bg-primary-50 dark:bg-primary-950/60 border-primary-100 dark:border-primary-900/60"
            title="Find Doctors"
            subtitle="Search verified cardiologists, neurologists, dermatologists by city, fee, and patient ratings."
            badgeText="Specialists"
            tagline="Symptom-matched doctors"
          />

          {/* 9. Medicine Store */}
          <SectionCard
            to="/medicine-store"
            icon={Pill}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBg="bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-900/60"
            title="Medicine Store"
            subtitle="Compare prices across Apollo, Tata 1mg, Netmeds. Verified genuine batch assurance and easy delivery."
            badgeText="Best Price"
            tagline="Live multi-seller price comparison"
          />
        </div>
      </div>
    </div>
  );
}
