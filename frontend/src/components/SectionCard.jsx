import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SectionCard({
  to,
  icon: Icon,
  emoji,
  iconColor = 'text-primary-600 dark:text-primary-400',
  iconBg = 'bg-primary-50 dark:bg-primary-950/60 border-primary-100 dark:border-primary-900/60',
  title,
  subtitle,
  badgeText,
  tagline
}) {
  return (
    <Link
      to={to}
      className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 card-hover flex flex-col justify-between transition-colors shadow-2xs hover:border-primary-300 dark:hover:border-primary-700/80"
    >
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${iconBg}`}>
            {Icon ? (
              <Icon className={`w-5 h-5 ${iconColor}`} />
            ) : (
              <span className="text-xl">{emoji}</span>
            )}
          </div>
          {badgeText && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        <span>{tagline || 'Open module'}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
