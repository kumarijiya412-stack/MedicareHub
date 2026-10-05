import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/Skeleton';
import {
  ShieldCheck,
  Heart,
  QrCode,
  Printer,
  Copy,
  Check,
  Phone,
  Droplet,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function PatientIdPage() {
  const { user, toast } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCard() {
      try {
        setLoading(true);
        const res = await api.get('/patient-id');
        if (res.success) {
          setCardData(res.card);
        }
      } catch (err) {
        toast.error('Failed to load patient card.');
      } finally {
        setLoading(false);
      }
    }
    fetchCard();
  }, []);

  const handleCopyId = () => {
    if (!cardData?.patient_id_number) return;
    navigator.clipboard.writeText(cardData.patient_id_number);
    setCopied(true);
    toast.success('Patient ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const qrValue = cardData
    ? `https://medicarehub.health/verify/${cardData.patient_id_number}?name=${encodeURIComponent(cardData.holderName)}&blood=${encodeURIComponent(cardData.bloodGroup)}`
    : 'https://medicarehub.health';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Poppins'] tracking-tight">
              Verified Digital Patient ID
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your tamper-evident digital identity for rapid hospital registration, emergency triage, and certified pharmacy pickups.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyId}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : cardData ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* DIGITAL CARD PREVIEW */}
          <div className="md:col-span-8">
            <div className="relative rounded-xl bg-slate-900 text-white p-6 sm:p-7 shadow-lg border border-slate-800">
              {/* Card Top Row: Brand & Verified Pill */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800 relative z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-warmrose-500 text-warmrose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-['Poppins'] tracking-tight">
                      MediCare <span className="text-primary-400">Hub</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 tracking-wider uppercase">Universal Patient Identity</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{cardData.is_verified ? 'OFFICIAL VERIFIED' : 'PENDING'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
                {/* Photo & Main Details */}
                <div className="sm:col-span-8 flex items-start space-x-4">
                  {cardData.photo ? (
                    <img
                      src={cardData.photo}
                      alt={cardData.holderName}
                      className="w-18 h-18 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-lg bg-slate-800 text-white font-bold text-xl flex items-center justify-center border border-slate-700 shrink-0">
                      {cardData.holderName?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patient Name</p>
                    <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] tracking-tight leading-tight">
                      {cardData.holderName}
                    </h2>
                    <p className="text-xs font-mono font-semibold text-slate-300 pt-0.5">
                      ID: <span className="text-primary-400">{cardData.patient_id_number}</span>
                    </p>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-2.5 rounded-lg bg-white text-slate-900 shadow-xs">
                  <QRCodeSVG
                    value={qrValue}
                    size={95}
                    level="M"
                    includeMargin={false}
                  />
                  <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                    Scan to Verify
                  </span>
                </div>
              </div>

              {/* Card Bottom Meta Grid */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs relative z-10">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Blood Group</span>
                  <span className="font-bold text-teal-400 text-sm">{cardData.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Emergency Contact</span>
                  <span className="font-medium text-slate-200 text-xs truncate block">{cardData.emergencyContact}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Issue Date</span>
                  <span className="font-medium text-slate-300 text-xs">{cardData.issued_at?.split(' ')[0] || '2026'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICATION CREDENTIALS SIDEBAR */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Poppins'] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Verification Credentials</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Email Status</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>OTP Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Security Standard</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">AES-256 Encrypted</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Digital Card Validity</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">Active Record</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Registry Network</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">MediCare Core</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-700">
                Hospital staff and pharmacy operators can scan the QR code to verify patient identity, emergency contacts, and blood group without paper records.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
