import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgColor = 'bg-[#15803D] border-emerald-600 text-white shadow-emerald-900/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-700 border-rose-600 text-white shadow-rose-950/20';
          Icon = XCircle;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-600 border-amber-500 text-white shadow-amber-950/20';
          Icon = AlertTriangle;
        }

        const titleText = typeof toast.message === 'object' ? toast.message.title : toast.title;
        const bodyText = typeof toast.message === 'object' ? toast.message.message : toast.message;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-fade-in-up ${bgColor}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              {titleText && (
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {titleText}
                </h4>
              )}
              <p className="text-xs font-medium leading-snug text-white/95">{bodyText}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
