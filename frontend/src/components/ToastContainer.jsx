import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let bg = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
          icon = <CheckCircle2 className="w-5 h-5 text-medgreen-600 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-200 text-rose-900';
          icon = <AlertCircle className="w-5 h-5 text-primary-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${bg}`}
          >
            <div className="mr-3 mt-0.5">{icon}</div>
            <div className="text-sm font-medium flex-1 pr-2 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
