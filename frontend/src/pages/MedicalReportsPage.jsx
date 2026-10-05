import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Calendar,
  Building,
  FileCheck,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function MedicalReportsPage() {
  const { activeMember, toast } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('Lab Test');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorOrLab, setDoctorOrLab] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  const memberQuery = activeMember ? `?family_member_id=${activeMember.id}` : '?family_member_id=self';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports${memberQuery}`);
      if (res.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load medical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeMember]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size limit: 10MB
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      toast.error('Invalid format. Please select a PDF, PNG, or JPG document.');
      return;
    }

    setFile(selected);
    if (!title) {
      // Auto fill title from filename
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a file to upload.');
      return;
    }
    if (!title) {
      toast.error('Report title is required.');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('report_file', file);
      formData.append('title', title);
      formData.append('report_type', reportType);
      formData.append('test_date', testDate);
      formData.append('doctor_or_lab', doctorOrLab);
      formData.append('notes', notes);
      if (activeMember) {
        formData.append('family_member_id', activeMember.id);
      } else {
        formData.append('family_member_id', 'self');
      }

      const res = await api.post('/reports/upload', formData);
      toast.success(res.message);
      setUploadModalOpen(false);
      setFile(null);
      setTitle('');
      setNotes('');
      fetchReports();
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id, repTitle) => {
    if (!window.confirm(`Delete "${repTitle}" from your reports vault?`)) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.info('Report deleted.');
      fetchReports();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/reports/${id}/download`, '_blank');
  };

  const handleOpenPreview = (rep) => {
    setPreviewReport(rep);
    setPreviewModalOpen(true);
  };

  const filtered = selectedType === 'all'
    ? reports
    : reports.filter(r => r.report_type === selectedType);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Medical Reports Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Encrypted storage for lab blood reports, radiology scans, and prescriptions for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeMember ? activeMember.full_name : 'Myself'}</strong>
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs transition-colors w-max focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Filter Tabs - Mobile Scrollable */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {['all', 'Lab Test', 'Radiology', 'Prescription', 'Discharge Summary', 'Other'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              selectedType === type
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {type === 'all' ? `All Reports (${reports.length})` : type}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No medical reports found"
          description="Upload your blood tests, X-rays, and specialist prescriptions to securely access them anytime."
          actionLabel="Upload First Report"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rep) => {
            const isPdf = rep.mime_type?.includes('pdf') || rep.file_name?.endsWith('.pdf');

            return (
              <div
                key={rep.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs card-hover space-y-4 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 ${
                        isPdf ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                      }`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {rep.report_type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] mt-1 line-clamp-1">
                          {rep.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(rep.id, rep.title)}
                      className="p-1.5 text-slate-400 hover:text-warmrose-600 dark:hover:text-warmrose-400 rounded-lg hover:bg-warmrose-50 dark:hover:bg-warmrose-950/30 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Test Date: <strong className="text-slate-700 dark:text-slate-300">{rep.test_date}</strong></span>
                    </div>

                    {rep.doctor_or_lab && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Lab / Provider: {rep.doctor_or_lab}</span>
                      </div>
                    )}
                  </div>

                  {rep.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {rep.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    {formatFileSize(rep.file_size)} • {rep.member_name || 'Myself'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenPreview(rep)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(rep.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Medical Report Document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Document (PDF, PNG, JPG - max 10MB) *
            </label>
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 transition-colors cursor-pointer relative">
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400 mx-auto mb-1.5" />
              {file ? (
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Selected: <span className="text-primary-600 dark:text-primary-400">{file.name}</span> ({formatFileSize(file.size)})
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">Click to browse</span> or drag and drop
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Blood Profile, Chest X-Ray PA View"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="Lab Test">Lab Test (Blood, Urine, Biopsy)</option>
                <option value="Radiology">Radiology (X-Ray, MRI, CT, Ultrasound)</option>
                <option value="Prescription">Physician Prescription</option>
                <option value="Discharge Summary">Hospital Discharge Summary</option>
                <option value="Other">Other Clinical Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Test / Procedure Date
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hospital / Diagnostic Lab Name
            </label>
            <input
              type="text"
              value={doctorOrLab}
              onChange={(e) => setDoctorOrLab(e.target.value)}
              placeholder="e.g. Dr. Lal PathLabs, Apollo Diagnostics"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Diagnostic Findings & Doctor Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hemoglobin normal, Vit D low (advised 60k IU weekly), lungs clear..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={uploadLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-2xs disabled:opacity-60 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {uploadLoading ? 'Uploading...' : 'Save & Encrypt Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewReport ? previewReport.title : 'Document Preview'}
        maxWidth="max-w-2xl"
      >
        {previewReport && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Type: <strong className="text-slate-900 dark:text-slate-100">{previewReport.report_type}</strong> • Date: {previewReport.test_date}</span>
              <button
                onClick={() => handleDownload(previewReport.id)}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>

            {previewReport.mime_type?.includes('image') || previewReport.file_name?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 max-h-[60vh] flex items-center justify-center">
                <img
                  src={`http://localhost:5000${previewReport.url}`}
                  alt={previewReport.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">PDF Document: {previewReport.file_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open this clinical report in a new tab for full document inspection.
                </p>
                <a
                  href={`http://localhost:5000${previewReport.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold text-xs shadow-2xs hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Full PDF in New Tab</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
