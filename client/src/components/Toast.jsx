import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-slate-900 text-slate-100 border-emerald-500/40 shadow-emerald-950/30',
    error: 'bg-slate-900 text-slate-100 border-rose-500/40 shadow-rose-950/30',
    info: 'bg-slate-900 text-slate-100 border-sky-500/40 shadow-sky-950/30'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 max-w-md ${bgStyles[type]}`}>
      {icons[type]}
      <div className="text-sm font-medium pr-2">{message}</div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
