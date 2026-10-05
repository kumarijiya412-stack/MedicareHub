import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { CardSkeleton } from '../components/Skeleton';
import {
  Dna,
  Plus,
  Trash2,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export default function FamilyGeneticPage() {
  const { toast } = useAuth();
  const [records, setRecords] = useState([]);
  const [hereditaryAnalysis, setHereditaryAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [relativeRelation, setRelativeRelation] = useState('Father');
  const [conditionName, setConditionName] = useState('');
  const [ageOfOnset, setAgeOfOnset] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchGeneticData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/family-genetic');
      if (res.success) {
        setRecords(res.records || []);
        setHereditaryAnalysis(res.hereditaryAnalysis || []);
      }
    } catch (err) {
      toast.error('Failed to load genetic health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneticData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conditionName) {
      toast.error('Condition name is required.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/family-genetic', {
        relative_relation: relativeRelation,
        condition_name: conditionName,
        age_of_onset: ageOfOnset,
        notes
      });

      toast.success(res.message);
      setModalOpen(false);
      setConditionName('');
      setAgeOfOnset('');
      setNotes('');
      fetchGeneticData();
    } catch (err) {
      toast.error(err.message || 'Error saving relative condition');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, cond) => {
    if (!window.confirm(`Delete "${cond}" from family genetic registry?`)) return;
    try {
      await api.delete(`/family-genetic/${id}`);
      toast.info('Record removed from genetic history.');
      fetchGeneticData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Dna className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Family Medical History & Genetic Risk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map familial conditions across biological relatives to uncover hereditary predispositions and preventive screening recommendations.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs transition-colors w-max focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Relative Condition</span>
        </button>
      </div>

      {/* Mandatory Non-Diagnosis Disclaimer */}
      <MedicalDisclaimer
        text="This hereditary risk analysis is strictly informational and based on recognized medical familial risk patterns. It is NOT a clinical diagnosis or genetic laboratory test. Please discuss these familial insights with your physician or genetic counselor."
        variant="amber"
      />

      {/* Hereditary Risk Analysis Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span>Possible Hereditary Risk Analysis</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : hereditaryAnalysis.length === 0 ? (
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            No family conditions logged yet. Add your parents or grandparents' medical conditions above to calculate hereditary insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hereditaryAnalysis.map((item, idx) => {
              let badgeStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
              let borderStyle = 'border-slate-200 dark:border-slate-800';

              if (item.level === 'Elevated') {
                badgeStyle = 'bg-warmrose-50 dark:bg-warmrose-950/40 text-warmrose-800 dark:text-warmrose-300 border-warmrose-200 dark:border-warmrose-900/60 font-bold';
                borderStyle = 'border-warmrose-200 dark:border-warmrose-900/60';
              } else if (item.level === 'Baseline') {
                badgeStyle = 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/60';
                borderStyle = 'border-slate-200 dark:border-slate-800';
              }

              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-5 border ${borderStyle} shadow-2xs card-hover space-y-4 flex flex-col justify-between transition-colors`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins']">
                        {item.category}
                      </h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                        {item.level} Risk
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.relativesInvolved?.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="text-slate-400 dark:text-slate-500">Affected relatives: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.relativesInvolved.join(', ')}</span>
                      </div>
                    )}

                    {/* Recommended Preventive Actions */}
                    {item.recommendedActions?.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Recommended Preventive Actions:
                        </p>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {item.recommendedActions.map((action, aIdx) => (
                            <li key={aIdx} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-primary-700 dark:text-primary-400">
                    <span className="flex items-center space-x-1 font-semibold">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Prompt: Share this assessment with your doctor</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Relatives Medical Conditions Table / Cards */}
      <div className="space-y-4 pt-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span>Biological Relatives Health Registry ({records.length})</span>
        </h2>

        {records.length === 0 ? (
          <EmptyState
            icon={Dna}
            title="No family conditions logged"
            description="Log medical diagnoses in your parents, siblings, or grandparents to receive personalized hereditary prevention advice."
            actionLabel="Add Relative Health Condition"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
                      {r.relative_relation}
                    </span>
                    <button
                      onClick={() => handleDelete(r.id, r.condition_name)}
                      className="text-slate-400 hover:text-warmrose-600 dark:hover:text-warmrose-400 p-1 rounded-lg hover:bg-warmrose-50 dark:hover:bg-warmrose-950/30 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Poppins']">
                    {r.condition_name}
                  </h4>

                  {r.age_of_onset && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Age of Onset: <strong className="text-slate-700 dark:text-slate-300">{r.age_of_onset} years</strong>
                    </p>
                  )}

                  {r.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {r.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                  Recorded: {r.created_at?.split(' ')[0] || 'Recently'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Condition Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Relative Health Condition"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Relative Relation *
              </label>
              <select
                value={relativeRelation}
                onChange={(e) => setRelativeRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="Father">Father (1st Degree)</option>
                <option value="Mother">Mother (1st Degree)</option>
                <option value="Brother">Brother (1st Degree)</option>
                <option value="Sister">Sister (1st Degree)</option>
                <option value="Paternal Grandfather">Paternal Grandfather (2nd Degree)</option>
                <option value="Paternal Grandmother">Paternal Grandmother (2nd Degree)</option>
                <option value="Maternal Grandfather">Maternal Grandfather (2nd Degree)</option>
                <option value="Maternal Grandmother">Maternal Grandmother (2nd Degree)</option>
                <option value="Maternal Uncle / Aunt">Maternal Uncle / Aunt</option>
                <option value="Paternal Uncle / Aunt">Paternal Uncle / Aunt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age of Diagnosis / Onset
              </label>
              <input
                type="number"
                min={1}
                max={110}
                value={ageOfOnset}
                onChange={(e) => setAgeOfOnset(e.target.value)}
                placeholder="e.g. 52"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Medical Condition / Diagnosis Name *
            </label>
            <input
              type="text"
              required
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              placeholder="e.g. Coronary Artery Disease, Type 2 Diabetes, Breast Cancer, Hypertension"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Context, Procedures & Treatments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Had stent placed in 2018; non-smoker; managed on daily medication..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {formLoading ? 'Evaluating Risk...' : 'Save & Calculate Hereditary Risk'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
