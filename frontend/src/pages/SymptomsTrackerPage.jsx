import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { CardSkeleton } from '../components/Skeleton';
import {
  Activity,
  Plus,
  Trash2,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function SymptomsTrackerPage() {
  const { activeMember, toast } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [timeline, setTimeline] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('2 days');
  const [loggedDate, setLoggedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/symptoms${memberQuery}`);
      if (res.success) {
        setSymptoms(res.symptoms);
        setTimeline(res.timeline || {});
      }
    } catch (err) {
      toast.error('Failed to load symptoms timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, [activeMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomName) {
      toast.error('Please enter the symptom name.');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/symptoms', {
        family_member_id: activeMember ? activeMember.id : 'self',
        symptom_name: symptomName,
        severity,
        duration,
        logged_date: loggedDate,
        notes
      });

      toast.success('Symptom logged to your timeline.');
      setModalOpen(false);
      setSymptomName('');
      setNotes('');
      fetchSymptoms();
    } catch (err) {
      toast.error(err.message || 'Failed to log symptom');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from your symptom timeline?`)) return;
    try {
      await api.delete(`/symptoms/${id}`);
      toast.info('Symptom log removed.');
      fetchSymptoms();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'severe':
        return 'bg-warmrose-100 dark:bg-warmrose-950/40 text-warmrose-800 dark:text-warmrose-300 border-warmrose-300 dark:border-warmrose-900/60 font-extrabold';
      case 'moderate':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900/60 font-bold';
      case 'mild':
      default:
        return 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-900/60 font-semibold';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Symptoms Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log physical symptoms over time and view recommended medical specialist types for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeMember ? activeMember.full_name : 'Myself'}</strong>
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs transition-colors w-max focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Log Symptom</span>
        </button>
      </div>

      {/* Mandatory Non-Diagnosis Disclaimer */}
      <MedicalDisclaimer
        text="This is not a medical diagnosis. Suggested specialist types are based on general triage guidelines to help you consult the right medical professional. Please consult a qualified doctor for any diagnosis or medication."
        variant="amber"
      />

      {/* Timeline List */}
      {loading ? (
        <div className="space-y-4 max-w-3xl">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : symptoms.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No symptoms logged"
          description="Log changes in how you feel, joint discomfort, cough, or headaches to track patterns and find the right specialist."
          actionLabel="Log First Symptom"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="max-w-4xl space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:hidden sm:before:block">
          {Object.entries(timeline).map(([dateKey, items]) => (
            <div key={dateKey} className="relative space-y-4">
              {/* Date Marker Header */}
              <div className="flex items-center space-x-3 sm:pl-10">
                <span className="hidden sm:flex absolute left-3 w-4 h-4 rounded-full bg-primary-600 ring-4 ring-slate-100 dark:ring-slate-900" />
                <div className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{dateKey}</span>
                </div>
              </div>

              {/* Items under this date */}
              <div className="space-y-3 sm:pl-10">
                {items.map((sym) => (
                  <div
                    key={sym.id}
                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins']">
                          {sym.symptom_name}
                        </h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(sym.severity)}`}>
                          {sym.severity} severity
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>Duration: {sym.duration}</span>
                        </span>
                      </div>

                      {sym.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                          {sym.notes}
                        </p>
                      )}

                      {/* Suggested Specialist Box */}
                      {sym.suggested_specialist && (
                        <div className="mt-2 p-3 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                              Suggested Specialist:{' '}
                              <strong className="font-semibold text-sky-900 dark:text-sky-300">{sym.suggested_specialist}</strong>
                            </span>
                          </div>

                          <Link
                            to={`/find-doctors?search=${encodeURIComponent(sym.suggested_specialist.split('/')[0].trim())}`}
                            className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 flex items-center space-x-1"
                          >
                            <span>Find Specialists</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-center justify-end space-x-2 md:space-x-0 md:space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
                      <button
                        onClick={() => handleDelete(sym.id, sym.symptom_name)}
                        className="p-2 text-slate-400 hover:text-warmrose-600 dark:hover:text-warmrose-400 rounded-xl hover:bg-warmrose-50 dark:hover:bg-warmrose-950/30 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Symptom Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log a Physical Symptom"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Symptom Description *
            </label>
            <input
              type="text"
              required
              value={symptomName}
              onChange={(e) => setSymptomName(e.target.value)}
              placeholder="e.g. Throbbing Headache, Dry Night Cough, Skin Rash, Joint Pain"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="mild">Mild (Noticeable but does not disrupt routine)</option>
                <option value="moderate">Moderate (Interferes with focus or daily work)</option>
                <option value="severe">Severe (Disabling, intense pain or distress)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 days, 1 week, since morning"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date Symptom Appeared
            </label>
            <input
              type="date"
              value={loggedDate}
              onChange={(e) => setLoggedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Triggers, Location & Context
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Worse in air-conditioned room; started after long screen session; left side of head..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {formLoading ? 'Logging...' : 'Save to Symptoms Timeline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
