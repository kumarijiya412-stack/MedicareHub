import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { CardSkeleton } from '../components/Skeleton';
import {
  TestTube2,
  CheckCircle2,
  Clock,
  Bell,
  BellOff,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  Shield,
  Sparkles,
  Info
} from 'lucide-react';

export default function RecommendedTestsPage() {
  const { activeMember, toast } = useAuth();
  const [tests, setTests] = useState([]);
  const [counts, setCounts] = useState({ due: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState('Metabolic');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('Annual');
  const [nextDueDate, setNextDueDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recommended-tests${memberQuery}`);
      if (res.success) {
        setTests(res.tests);
        setCounts(res.counts || { due: 0, done: 0, total: 0 });
      }
    } catch (err) {
      toast.error('Failed to load preventive screening tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [activeMember]);

  const handleToggleStatus = async (id, currentStatus, title) => {
    try {
      const res = await api.patch(`/recommended-tests/${id}/toggle-status`, {});
      toast.success(res.message);
      fetchTests();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      const res = await api.patch(`/recommended-tests/${id}/toggle-reminder`, {});
      toast.info(res.message);
      fetchTests();
    } catch (err) {
      toast.error(err.message || 'Failed to update reminder');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from your test reminders?`)) return;
    try {
      await api.delete(`/recommended-tests/${id}`);
      toast.info('Test removed from tracker.');
      fetchTests();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName) {
      toast.error('Test name is required.');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/recommended-tests', {
        family_member_id: activeMember ? activeMember.id : 'self',
        test_name: testName,
        category,
        description,
        frequency,
        next_due_date: nextDueDate || null
      });

      toast.success('Preventive screening test added to tracker.');
      setModalOpen(false);
      setTestName('');
      setDescription('');
      fetchTests();
    } catch (err) {
      toast.error(err.message || 'Error adding test');
    } finally {
      setFormLoading(false);
    }
  };

  // Healthcare Category Tabs
  const healthcareTabs = [
    { id: 'all', label: 'All Checks', icon: Activity },
    { id: 'heart', label: 'Heart Health', icon: Heart, match: ['Cardiovascular', 'Heart', 'Lipid'] },
    { id: 'metabolic', label: 'Blood & Metabolic', icon: TestTube2, match: ['Metabolic', 'Diabetes', 'Glucose'] },
    { id: 'cancer', label: 'Cancer Screening', icon: Shield, match: ['Cancer', 'Oncology'] },
    { id: 'vitamins', label: 'Bone, Joint & Vits', icon: Sparkles, match: ['Vitamins', 'Bone', 'Joint'] },
    { id: 'general', label: 'General & Vaccines', icon: CheckCircle2, match: ['General', 'Vaccine', 'Annual'] },
  ];

  // Filtering Logic
  const filteredTests = tests.filter((t) => {
    // 1. Status Filter
    if (filterStatus !== 'all' && t.status !== filterStatus) {
      return false;
    }
    // 2. Category Tab Filter
    if (selectedCategoryTab === 'all') {
      return true;
    }
    const targetTab = healthcareTabs.find(tab => tab.id === selectedCategoryTab);
    if (!targetTab || !targetTab.match) return true;

    return targetTab.match.some(m => (t.category || '').toLowerCase().includes(m.toLowerCase()) || (t.test_name || '').toLowerCase().includes(m.toLowerCase()));
  });

  // Extract key bullet points for progressive disclosure
  const getKeyBullets = (test) => {
    const text = test.description || '';
    if (text.includes('Total Cholesterol')) {
      return ['Total Cholesterol & Triglycerides', 'HDL ("Good") & LDL ("Bad") levels', 'Atherosclerotic cardiovascular index'];
    }
    if (text.includes('insulin') || text.includes('diabetes') || test.test_name.includes('Glucose')) {
      return ['Fasting plasma glucose (FPG)', 'HbA1c 3-month glycemic control', 'Early insulin resistance warning'];
    }
    if (text.includes('red cells') || test.test_name.includes('CBC')) {
      return ['Hemoglobin & Hematocrit', 'White Blood Cells (Infection response)', 'Platelet count (Coagulation)'];
    }
    if (text.includes('Vitamin') || text.includes('B12')) {
      return ['25-OH Vitamin D (Bone mineralization)', 'Serum B12 (Nerve health & RBC production)', 'Immune system modulation'];
    }
    if (text.includes('C-Reactive') || text.includes('CRP')) {
      return ['High-sensitivity vascular inflammation', 'Arterial plaque stability indicator', 'Combined cardiac risk score'];
    }
    return [
      `Recommended cadence: ${test.frequency || 'Annual review'}`,
      'Primary preventive surveillance marker',
      'Clinical baseline for medical history'
    ];
  };

  const getPrepNote = (test) => {
    const name = test.test_name.toLowerCase();
    if (name.includes('lipid') || name.includes('glucose') || name.includes('sugar') || name.includes('fasting')) {
      return 'Requires 10–12 hours of overnight fasting. Plain water is permitted.';
    }
    if (name.includes('vitamin') || name.includes('cbc')) {
      return 'No strict fasting required. Routine venous blood draw.';
    }
    return 'Consult your physician regarding medication hold instructions before sampling.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
              <TestTube2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Recommended Preventive Checks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Age, gender, and risk-based screening guidance for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeMember ? activeMember.full_name : 'Myself'}</strong>
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-xs transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Check</span>
        </button>
      </div>

      {/* Clinical Disclaimer */}
      <MedicalDisclaimer
        text="Preventive test schedules are educational clinical guidelines based on standard adult preventive protocols. Always verify screening intervals with your physician."
        variant="amber"
      />

      {/* HEALTHCARE TABS (Horizontal Scroll on Mobile, Clean on Desktop) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-3">
        {/* Healthcare System Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {healthcareTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : tab.id === 'heart' ? 'text-warmrose-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Status Filter Pills (All / Due / Completed) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setFilterStatus('due')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
                filterStatus === 'due'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Due ({counts.due})</span>
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
                filterStatus === 'done'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed ({counts.done})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Showing {filteredTests.length} check{filteredTests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Contextual Medical Visual Banner based on Selected Tab */}
      {selectedCategoryTab === 'heart' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center gap-6 transition-colors">
          <div className="w-full md:w-48 h-40 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700/60 flex items-center justify-center p-2">
            <img
              src="/images/heart_health_illustration.jpg"
              alt="Cardiovascular medical anatomical illustration"
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded"
              loading="lazy"
            />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-warmrose-50 dark:bg-warmrose-950/40 text-warmrose-700 dark:text-warmrose-300 text-xs font-semibold border border-warmrose-200/60 dark:border-warmrose-900/40">
              <Heart className="w-3.5 h-3.5 fill-warmrose-500/20" />
              <span>Cardiovascular Health Protocol</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Heart & Vascular Surveillance
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Early lipid profiling (LDL, HDL, triglycerides) and high-sensitivity CRP testing detect arterial inflammation years before clinical symptoms manifest. Maintain healthy blood pressure and follow up on any hereditary risk factors.
            </p>
          </div>
        </div>
      )}

      {selectedCategoryTab === 'all' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center gap-6 transition-colors">
          <div className="w-full md:w-56 h-36 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700">
            <img
              src="/images/preventive_screening.jpg"
              alt="Clinician discussing preventive screening tests with patient"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-200/60 dark:border-primary-900/40">
              <Activity className="w-3.5 h-3.5" />
              <span>Evidence-Based Screening Schedules</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Personalized Preventive Roadmap
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Regular annual checks are designed to detect emerging conditions early. Below are tests recommended for your profile. Expand any card to view required fasting guidelines, standard metrics, and preparation tips.
            </p>
          </div>
        </div>
      )}

      {(selectedCategoryTab === 'metabolic' || selectedCategoryTab === 'vitamins') && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center gap-6 transition-colors">
          <div className="w-full md:w-56 h-36 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700">
            <img
              src="/images/nutrition_lifestyle_wellness.jpg"
              alt="Fresh wholesome foods for metabolic wellness"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200/60 dark:border-teal-900/40">
              <TestTube2 className="w-3.5 h-3.5" />
              <span>Metabolic & Nutritional Balance</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Blood Chemistry & Nutrient Absorption
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Monitoring HbA1c, fasting glucose, Vitamin D3, and serum B12 provides a complete snapshot of energy metabolism and cellular health. Pair clinical checks with daily movement and wholesome nutrition.
            </p>
          </div>
        </div>
      )}

      {/* Tests Grid with Progressive Disclosure */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTests.length === 0 ? (
        <EmptyState
          title="No screening tests found in this category"
          description="Switch to 'All Checks' or add a custom test to keep your preventive schedule up to date."
          actionLabel="Show All Checks"
          onAction={() => {
            setSelectedCategoryTab('all');
            setFilterStatus('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => {
            const isDue = test.status === 'due';
            const isExpanded = expandedCardId === test.id;
            const bullets = getKeyBullets(test);
            const prepNote = getPrepNote(test);
            const isHeartCheck = (test.category || '').toLowerCase().includes('cardio') || test.test_name.toLowerCase().includes('lipid') || test.test_name.toLowerCase().includes('crp');

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between transition-colors"
              >
                <div>
                  {/* Category Badge & Top Controls */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                        {isHeartCheck && <Heart className="w-3 h-3 fill-warmrose-500 text-warmrose-500" />}
                        <span>{test.category}</span>
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        • {test.frequency}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Reminder Switch */}
                      <button
                        onClick={() => handleToggleReminder(test.id)}
                        className={`p-1.5 rounded-md border transition-colors ${
                          test.reminder_enabled
                            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title={test.reminder_enabled ? 'Notification alert active' : 'Reminders muted'}
                      >
                        {test.reminder_enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(test.id, test.test_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {test.test_name}
                  </h3>

                  {/* Short Summary (What to know - 1-2 concise sentences) */}
                  {test.description && (
                    <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <p className="line-clamp-2">{test.description}</p>
                    </div>
                  )}

                  {/* Progressive Disclosure: Key Checks bullet points */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Key Evaluation Checks
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-1.5">
                          <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Collapsible Details ("Learn More" control) */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedCardId(isExpanded ? null : test.id)}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center space-x-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide clinical preparation & guidelines' : 'Learn more & prep instructions'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-lg bg-blue-50/50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                          <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Patient Preparation:</span>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{prepNote}</p>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-blue-100 dark:border-slate-700 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Target Frequency: {test.frequency}</span>
                          <span>Reporting: Digital Vault</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Timestamps */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {test.last_done_date && (
                      <span className="flex items-center space-x-1 text-teal-700 dark:text-teal-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Last done: {test.last_done_date}</span>
                      </span>
                    )}
                    {test.next_due_date && (
                      <span className={`flex items-center space-x-1 font-medium ${isDue ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Next due: {test.next_due_date}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Toggle Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    isDue
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                  }`}>
                    {isDue ? 'Due for Screening' : 'Completed'}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(test.id, test.status, test.test_name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                      isDue
                        ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDue ? 'Mark as Done' : 'Mark as Due'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Test Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Preventive Screening Test"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Test Name *
            </label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Comprehensive Lipid Profile, HbA1c, Thyroid Panel"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-900"
              >
                <option value="Cardiovascular">Heart Health (Lipid, ECG)</option>
                <option value="Metabolic">Blood & Metabolic (HbA1c, Glucose)</option>
                <option value="General Screen">General & CBC</option>
                <option value="Cancer Screen">Cancer Screening</option>
                <option value="Vitamins & Minerals">Bone, Joint & Vitamins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Cadence / Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-900"
              >
                <option value="Annual">Annual (Once a year)</option>
                <option value="Every 6 Months">Every 6 Months</option>
                <option value="Quarterly (Every 3 Months)">Quarterly</option>
                <option value="Every 3 Years">Every 3 Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Next Due Date
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Clinical Rationale & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this check is recommended for your health profile..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-xs disabled:opacity-60 transition-colors"
            >
              {formLoading ? 'Adding...' : 'Add Preventive Check'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
