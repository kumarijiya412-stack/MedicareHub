import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function MedicalDisclaimer({
  text = "This is not a medical diagnosis or treatment prescription. Information displayed is for educational and tracking purposes. Always consult a qualified physician for clinical evaluation and health concerns.",
  variant = "amber"
}) {
  const isRose = variant === 'rose';

  return (
    <div
      className={`rounded-lg p-3.5 border flex items-start space-x-3 text-xs sm:text-sm leading-relaxed mb-6 ${
        isRose
          ? 'bg-rose-50/60 dark:bg-warmrose-950/25 border-rose-200 dark:border-warmrose-900/40 text-warmrose-950 dark:text-warmrose-200'
          : 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200'
      }`}
    >
      {isRose ? (
        <ShieldAlert className="w-4 h-4 text-warmrose-600 dark:text-warmrose-400 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      )}
      <div>
        <span className="font-semibold block sm:inline mr-1 text-slate-900 dark:text-slate-100">Clinical Disclaimer:</span>
        <span className="text-slate-700 dark:text-slate-300">{text}</span>
      </div>
    </div>
  );
}
