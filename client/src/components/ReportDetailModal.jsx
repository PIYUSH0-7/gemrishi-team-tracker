import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Printer, 
  Calendar, 
  User, 
  Building2, 
  TrendingUp, 
  FileCheck, 
  Sparkles, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatReportToPlainText } from '../utils/parser';

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onResendEmail,
  onDeleteReport,
  showToast
}) {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

  if (!isOpen || !report) return null;

  const plainText = formatReportToPlainText(report);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    showToast('Report copied in WhatsApp format!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResendEmail(report.id, showCustomEmailInput ? customEmail : null);
    } finally {
      setIsResending(false);
    }
  };

  const statusBadges = {
    sent: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Emailed to Manager'
    },
    preview_only: {
      bg: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: <Mail className="w-3.5 h-3.5 text-sky-600" />,
      label: 'Saved (SMTP Not Configured)'
    },
    failed: {
      bg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
      label: 'Email Failed'
    },
    pending: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      label: 'Email Pending'
    }
  };

  const status = statusBadges[report.emailStatus] || statusBadges.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/30 rounded-2xl border border-emerald-400/30">
              <FileCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white m-0">{report.employeeName}</h2>
                <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  {report.department}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 m-0 mt-0.5">
                Work Report &bull; {report.reportDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print report"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info & Status Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Delivery Status:</span>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${status.bg}`}>
              {status.icon}
              {status.label}
            </span>
            {report.emailRecipient && (
              <span className="text-slate-500 hidden sm:inline">
                ({report.emailRecipient})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy WhatsApp Text'}
            </button>

            {onDeleteReport && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete report for ${report.employeeName}?`)) {
                    onDeleteReport(report.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Employee</span>
              <span className="text-sm font-bold text-slate-800">{report.employeeName}</span>
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="text-sm font-bold text-emerald-700">{report.department}</span>
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Report Date</span>
              <span className="text-sm font-bold text-slate-800">{report.reportDate}</span>
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Submitted At</span>
              <span className="text-sm font-medium text-slate-600">
                {report.submittedAt ? new Date(report.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Targets */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Targets Planned ({report.targets?.length || 0})
            </h3>
            {report.targets?.length > 0 ? (
              <ul className="space-y-2">
                {report.targets.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No targets specified.</p>
            )}
          </div>

          {/* Work Completed */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              Work Completed ({report.workCompleted?.length || 0})
            </h3>
            {report.workCompleted?.length > 0 ? (
              <ul className="space-y-2">
                {report.workCompleted.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-900 font-medium">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-2xs font-bold flex items-center justify-center mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No completed tasks specified.</p>
            )}
          </div>

          {/* Results */}
          <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs">
            <h3 className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Results & Outcomes ({report.results?.length || 0})
            </h3>
            {report.results?.length > 0 ? (
              <ul className="space-y-2">
                {report.results.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-2xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No results specified.</p>
            )}
          </div>

          {/* Pending Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Tasks & Next Steps ({report.pendingTasks?.length || 0})
            </h3>
            {report.pendingTasks?.length > 0 ? (
              <ul className="space-y-2">
                {report.pendingTasks.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-2xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No pending tasks.</p>
            )}
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Additional Notes
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report.notes}
              </p>
            </div>
          )}

        </div>

        {/* Bottom Resend & Actions Bar */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showCustomEmailInput ? (
              <div className="flex items-center gap-2 w-full sm:w-80">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter email to dispatch to..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomEmailInput(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
              >
                + Send to custom email
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              disabled={isResending}
              onClick={handleResend}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Resend Email
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
