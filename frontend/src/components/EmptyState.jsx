import React from 'react';
import { Plus, FileText } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileText,
  iconColor = 'text-primary-600 dark:text-primary-400',
  iconBg = 'bg-primary-50 dark:bg-primary-950/60 border-primary-100 dark:border-primary-900/60',
  emoji,
  title = 'No records found',
  description = 'You have not added any entries yet. Click below to add your first record.',
  actionLabel,
  onAction
}) {
  return (
    <div className="text-center py-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 shadow-2xs max-w-md mx-auto my-6">
      <div className="flex justify-center mb-3">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBg}`}>
          {Icon ? <Icon className={`w-6 h-6 ${iconColor}`} /> : <span className="text-2xl">{emoji}</span>}
        </div>
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-['Poppins'] mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-2xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
