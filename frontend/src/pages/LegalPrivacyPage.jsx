import React from 'react';
import { ShieldCheck, Lock, AlertCircle, FileText, CheckCircle2, Scale } from 'lucide-react';

export default function LegalPrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 items-center justify-center border border-slate-200 dark:border-slate-700 mb-1">
          <Scale className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy, Terms & Compliance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 2026 • MediCare Hub Governance Framework
        </p>
      </div>

      {/* Real-World Launch Readiness Note */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-semibold">
            Regulatory Roadmap for Real-World Deployment
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Before transitioning MediCare Hub from local development/staging to real-world clinical and commercial operation in live healthcare ecosystems, the following legal and operational prerequisites must be enacted:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
          <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              <span>India DPDP Act (2023) Compliance</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Appointment of a Data Protection Officer (DPO), explicit multilingual consent mechanisms, parent verification for pediatric health tracking (&lt;18 years), and localized data processing within certified MeitY cloud regions.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span>Licensed Pharmacy Partnerships</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Execution of formal Tripartite Partner Agreements with state-licensed pharmacies (Form 20/21 Drug Licenses), real-time CDSCO barcode tracking, and registered pharmacist digital signature verification for Schedule H/X drugs.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>HIPAA & GDPR Safeguards</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              For international cross-border deployment: Business Associate Agreements (BAAs), SOC2 Type II compliance, zero-knowledge encryption keys for medical records, and continuous vulnerability assessment.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warmrose-500" />
              <span>Clinical Diagnostic Disclaimer</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Formal clearance that symptom triage algorithms constitute Clinical Decision Support (CDS) guidance and do not operate as regulated Software as a Medical Device (SaMD) without Central Drugs Authority approvals.
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Service Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Terms of Service & Usage Agreement
        </h2>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">1. Not a Substitute for Emergency Medical Care</h3>
          <p>
            MediCare Hub is an electronic personal health companion. It does not offer emergency diagnostic intervention or direct clinical prescription services. If you experience acute chest pain, sudden numbness, or shortness of breath, please immediately contact emergency services (911 in the US, 112 in India).
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">2. Family Account Authorization</h3>
          <p>
            By adding family members (dependents, spouses, or parents), you represent that you hold legal consent or parental guardianship to log health vitals and schedule medical consultations on their behalf.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">3. Medicine Store & Price Comparisons</h3>
          <p>
            Prices displayed across third-party sellers (Apollo Pharmacy, Tata 1mg, Netmeds, PharmEasy) reflect publicly accessible or partner-provided feeds. Prescription-required drugs require valid medical documentation before dispensation.
          </p>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Privacy Policy & Sensitive Health Data Handling
        </h2>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">1. Information We Collect</h3>
          <p>
            We collect personal identity data (name, email, phone, date of birth) and sensitive personal data (blood group, medical history, physical symptoms, uploaded laboratory reports, and family hereditary conditions).
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">2. How Data is Used & Protected</h3>
          <p>
            Your health records are used solely to generate your verified digital health ID, provide preventive test reminders, and match specialist doctors. All data is encrypted at rest and in transit. We never sell health information to third-party advertisers.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">3. Your Data Rights</h3>
          <p>
            Under modern privacy legislation (including the DPDP Act 2023 and GDPR), you retain the right to download your entire health record in JSON format and the right to permanently delete your account and all associated medical files at any time via your Profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
