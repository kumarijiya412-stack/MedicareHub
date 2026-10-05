import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import {
  Stethoscope,
  Search,
  MapPin,
  Star,
  Calendar,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
  DollarSign,
  Filter
} from 'lucide-react';

export default function FindDoctorsPage() {
  const { user, activeMember, toast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [suggestedDoctors, setSuggestedDoctors] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ specialties: [], cities: [] });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [minRating, setMinRating] = useState('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [apptDate, setApptDate] = useState('');
  const [apptSlot, setApptSlot] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch doctors & suggestions
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (selectedSpecialty !== 'All') query.append('specialty', selectedSpecialty);
      if (selectedCity !== 'All') query.append('city', selectedCity);
      if (minRating) query.append('min_rating', minRating);

      const [docsRes, suggestedRes] = await Promise.all([
        api.get(`/doctors?${query.toString()}`),
        user ? api.get('/doctors/suggested') : Promise.resolve({ suggestedDoctors: [] })
      ]);

      if (docsRes.success) {
        setDoctors(docsRes.doctors || []);
        if (docsRes.filters) setFilterOptions(docsRes.filters);
      }

      if (suggestedRes.success) {
        setSuggestedDoctors(suggestedRes.suggestedDoctors || []);
      }
    } catch (err) {
      toast.error('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, selectedSpecialty, selectedCity, minRating]);

  const handleOpenBooking = (doc) => {
    setSelectedDoctor(doc);
    // Default tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setApptDate(tomorrow.toISOString().split('T')[0]);
    setApptSlot(doc.available_time_slots?.[0] || '10:00 AM');
    setApptReason('General consultation & health review');
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to confirm an appointment.');
      return;
    }

    if (!apptDate || !apptSlot || !apptReason) {
      toast.error('Please complete all booking fields.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        family_member_id: activeMember ? activeMember.id : 'self',
        appointment_date: apptDate,
        time_slot: apptSlot,
        reason: apptReason
      });

      toast.success(res.message);
      setBookingModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900/60 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-['Poppins']">
            Find Verified Specialists
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search hospital cardiologists, neurologists, dermatologists, and pediatricians by specialty, city, and verified ratings.
        </p>
      </div>

      {/* Suggested Doctors Strip (Based on user symptoms) */}
      {user && suggestedDoctors.length > 0 && !searchTerm && selectedSpecialty === 'All' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Suggested Specialists Based on Your Health Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {suggestedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between card-hover transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-2.5">
                    <img
                      src={doc.image_url}
                      alt={doc.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{doc.name}</h4>
                      <p className="text-[11px] font-medium text-primary-600 dark:text-primary-400">{doc.specialty}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                    "{doc.recommendationReason}"
                  </p>
                </div>

                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-xs transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  Book Visit • ₹{doc.consultation_fee}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor name, condition, or hospital..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Specialty Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Specialties</option>
              {filterOptions.specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="sm:col-span-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="">Any Rating</option>
              <option value="4.8">4.8+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors match your filter"
          description="Try clearing your search keyword or selecting 'All Specialties'."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedSpecialty('All');
            setSelectedCity('All');
            setMinRating('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs card-hover transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4">
                  <img
                    src={doc.image_url}
                    alt={doc.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {doc.specialty}
                      </span>
                      <div className="flex items-center space-x-1 text-xs font-semibold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal">({doc.review_count})</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1 font-['Poppins']">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {doc.qualification} • {doc.experience_years} yrs exp
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1 pt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{doc.hospital_name}, {doc.city}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed line-clamp-2">
                  {doc.bio}
                </p>

                {doc.treatable_conditions && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doc.treatable_conditions.split(',').slice(0, 4).map((cond, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {cond.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-semibold">Consultation Fee</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">₹{doc.consultation_fee}</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center space-x-1.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Book Doctor Consultation"
      >
        {selectedDoctor && (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center space-x-3 text-xs">
              <img
                src={selectedDoctor.image_url}
                alt={selectedDoctor.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{selectedDoctor.name}</h4>
                <p className="text-primary-600 dark:text-primary-400 font-medium">{selectedDoctor.specialty} • {selectedDoctor.hospital_name}</p>
                <p className="text-slate-500 dark:text-slate-400">Consultation Fee: ₹{selectedDoctor.consultation_fee}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Booking For Profile
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200">
                {activeMember ? `${activeMember.full_name} (${activeMember.relation})` : `${user?.full_name} (Myself)`}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Choose Consultation Date *
              </label>
              <input
                type="date"
                required
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Select Available Slot *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedDoctor.available_time_slots?.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setApptSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      apptSlot === slot
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Reason for Consultation *
              </label>
              <input
                type="text"
                required
                value={apptReason}
                onChange={(e) => setApptReason(e.target.value)}
                placeholder="e.g. Recurrent tension headaches, chest discomfort review..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {bookingLoading ? 'Confirming with Hospital...' : `Confirm Booking (₹${selectedDoctor.consultation_fee})`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
