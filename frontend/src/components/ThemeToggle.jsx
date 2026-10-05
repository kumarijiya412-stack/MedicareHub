import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabels = false }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      {options.map(({ key, label, icon: Icon }) => {
        const isSelected = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            title={`Switch to ${label} mode`}
            aria-pressed={isSelected}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
