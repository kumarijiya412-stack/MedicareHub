import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Pill,
  Scissors,
  ShieldAlert,
  Calendar,
  Filter
} from 'lucide-react';

export default function MedicalHistoryPage() {
  const { activeMember, toast } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('condition');
  const [title, setTitle] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medical-history${memberQuery}`);
      if (res.success) {
        setRecords(res.records);
      }
    } catch (err) {
      toast.error('Failed to load medical history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeMember]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCategory('condition');
    setTitle('');
    setDiagnosedDate(new Date().toISOString().split('T')[0]);
    setStatus('active');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingId(rec.id);
    setCategory(rec.category);
    setTitle(rec.title);
    setDiagnosedDate(rec.diagnosed_date || '');
    setStatus(rec.status || 'active');
    setNotes(rec.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Record title is required.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        family_member_id: activeMember ? activeMember.id : 'self',
        category,
        title,
        diagnosed_date: diagnosedDate,
        status,
        notes
      };

      if (editingId) {
        await api.put(`/medical-history/${editingId}`, payload);
        toast.success('Medical record updated successfully.');
      } else {
        await api.post('/medical-history', payload);
        toast.success('New medical entry added to history.');
      }

      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Error saving record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${itemTitle}" from medical history?`)) return;
    try {
      await api.delete(`/medical-history/${id}`);
      toast.info('Record deleted from medical history.');
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
    }
  };

  const filteredRecords = selectedCategory === 'all'
    ? records
    : records.filter(r => r.category === selectedCategory);

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'condition':
        return { Icon: Stethoscope, label: 'Condition', bg: 'bg-warmrose-50 dark:bg-warmrose-950/30 text-warmrose-700 dark:text-warmrose-300 border-warmrose-200 dark:border-warmrose-900/40' };
      case 'allergy':
        return { Icon: AlertTriangle, label: 'Allergy', bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40' };
      case 'surgery':
        return { Icon: Scissors, label: 'Surgery', bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40' };
      case 'medication':
        return { Icon: Pill, label: 'Medication', bg: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/40' };
      default:
        return { Icon: Stethoscope, label: cat, bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Medical History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Managing chronic conditions, surgeries, drug allergies, and medications for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeMember ? activeMember.full_name : 'Myself'}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs transition-colors w-max focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Mobile-Scrollable Healthcare Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { key: 'all', label: 'All Records', count: records.length, icon: Filter },
          { key: 'condition', label: 'Conditions', count: records.filter(r => r.category === 'condition').length, icon: Stethoscope },
          { key: 'allergy', label: 'Allergies', count: records.filter(r => r.category === 'allergy').length, icon: AlertTriangle },
          { key: 'surgery', label: 'Surgeries', count: records.filter(r => r.category === 'surgery').length, icon: Scissors },
          { key: 'medication', label: 'Daily Medications', count: records.filter(r => r.category === 'medication').length, icon: Pill },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selectedCategory === tab.key
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === tab.key ? 'bg-white/30 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No medical records found in this category"
          description="Keep your clinical profile comprehensive so doctors have complete context during emergencies."
          actionLabel="Add New Entry"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((item) => {
            const meta = getCategoryMeta(item.category);
            const CatIcon = meta.Icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.bg} flex items-center space-x-1.5`}>
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{meta.label}</span>
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'active'
                          ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40'
                          : item.status === 'managed'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-warmrose-600 dark:hover:text-warmrose-400 rounded-lg hover:bg-warmrose-50 dark:hover:bg-warmrose-950/30 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins']">
                    {item.title}
                  </h3>

                  {item.diagnosed_date && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 mt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Diagnosed / Initiated: {item.diagnosed_date}</span>
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between items-center">
                  <span>Record for: {item.member_name || 'Myself'}</span>
                  <span>Recorded on {item.created_at?.split(' ')[0] || 'Recently'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Medical Record' : 'Add Medical Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="condition">Medical Condition (e.g. Asthma, Diabetes)</option>
              <option value="allergy">Allergy (e.g. Penicillin, Peanuts)</option>
              <option value="surgery">Surgery / Procedure (e.g. Appendectomy)</option>
              <option value="medication">Daily Medication (e.g. Inhaler, Statin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Diagnosis Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mild Asthma, Penicillin Allergy"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date (Diagnosed / Treated)
              </label>
              <input
                type="date"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="managed">Managed / Under Control</option>
                <option value="resolved">Resolved / Past History</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physician Notes, Triggers & Dosage Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Details on symptoms, triggers, dosage frequency, hospital name..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {formLoading ? 'Saving...' : editingId ? 'Update Record' : 'Save to Medical History'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
