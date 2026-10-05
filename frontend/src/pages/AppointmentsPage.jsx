import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  User
} from 'lucide-react';

export default function AppointmentsPage() {
  const { activeMember, toast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('upcoming');
  const [counts, setCounts] = useState({ upcoming: 0, completed: 0, total: 0 });

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [newReason, setNewReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/appointments${memberQuery}`);
      if (res.success) {
        setAppointments(res.appointments || []);
        setCounts(res.counts || { upcoming: 0, completed: 0, total: 0 });
      }
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeMember]);

  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    setNewDate(appt.appointment_date);
    setNewSlot(appt.time_slot);
    setNewReason(appt.reason);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) {
      toast.error('Date and time slot are required.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await api.patch(`/appointments/${selectedAppt.id}/reschedule`, {
        appointment_date: newDate,
        time_slot: newSlot,
        reason: newReason
      });

      toast.success(res.message);
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Reschedule failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = async (id, doctorName) => {
    if (!window.confirm(`Are you sure you want to cancel your consultation with ${doctorName}?`)) return;
    try {
      const res = await api.patch(`/appointments/${id}/cancel`, {});
      toast.info(res.message);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  const filtered = filterStatus === 'all'
    ? appointments
    : filterStatus === 'upcoming'
    ? appointments.filter(a => a.status === 'upcoming' || a.status === 'rescheduled')
    : appointments.filter(a => a.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Doctor Check-ups & Appointments
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage scheduled hospital consultations and clinical visits for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeMember ? activeMember.full_name : 'Myself'}</strong>
          </p>
        </div>

        <Link
          to="/find-doctors"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs transition-colors w-max focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </Link>
      </div>

      {/* Filter Tabs - Mobile Scrollable */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setFilterStatus('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            filterStatus === 'upcoming'
              ? 'bg-primary-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Upcoming Visits ({counts.upcoming})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            filterStatus === 'completed'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Past Visits ({counts.completed})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
            filterStatus === 'all'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Appointments ({counts.total})
        </button>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments in this view"
          description="Schedule a consultation with top cardiologists, neurologists, or pediatricians."
          actionLabel="Find a Specialist"
          onAction={() => window.location.href = '/find-doctors'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((appt) => {
            const isUpcoming = appt.status === 'upcoming' || appt.status === 'rescheduled';

            return (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover space-y-4 flex flex-col justify-between transition-colors"
              >
                <div>
                  {/* Doctor Info Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={appt.doctor_image}
                        alt={appt.doctor_name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Poppins']">
                          {appt.doctor_name}
                        </h3>
                        <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {appt.doctor_specialty}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{appt.hospital_name}, {appt.doctor_city}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      appt.status === 'upcoming'
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-900/60'
                        : appt.status === 'rescheduled'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                        : appt.status === 'completed'
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Date & Time Slot Banner */}
                  <div className="mt-3.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      <span>{appt.appointment_date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-semibold text-primary-700 dark:text-primary-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{appt.time_slot}</span>
                    </div>
                  </div>

                  {/* Reason for visit */}
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Reason for Visit
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                      {appt.reason}
                    </p>
                  </div>

                  {appt.notes && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <strong className="text-slate-700 dark:text-slate-300">Clinic Note:</strong> {appt.notes}
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Patient: <strong className="text-slate-700 dark:text-slate-300">{appt.member_name || 'Myself'}</strong> • Fee: ₹{appt.consultation_fee}
                  </span>

                  {isUpcoming && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenReschedule(appt)}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleCancel(appt.id, appt.doctor_name)}
                        className="px-3 py-1 rounded-lg bg-warmrose-50 dark:bg-warmrose-950/30 hover:bg-warmrose-100 dark:hover:bg-warmrose-950/50 text-warmrose-700 dark:text-warmrose-300 font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
      >
        {selectedAppt && (
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              Rescheduling appointment with <strong className="text-slate-900 dark:text-slate-100">{selectedAppt.doctor_name}</strong> ({selectedAppt.doctor_specialty}).
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select New Date *
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Slot *
              </label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="09:00 AM">09:00 AM - Morning Slot</option>
                <option value="10:30 AM">10:30 AM - Morning Slot</option>
                <option value="11:30 AM">11:30 AM - Midday Slot</option>
                <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                <option value="04:00 PM">04:00 PM - Evening Slot</option>
                <option value="06:00 PM">06:00 PM - Evening Slot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Updated Reason or Note
              </label>
              <textarea
                rows={2}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {modalLoading ? 'Updating slot...' : 'Confirm Rescheduled Visit'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
