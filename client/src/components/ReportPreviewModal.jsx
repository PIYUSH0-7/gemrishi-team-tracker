import React, { useState } from 'react';
import { X, Mail, Copy, Check, Printer, FileText, Send, Sparkles } from 'lucide-react';
import { formatReportToPlainText } from '../utils/parser';
import { downloadReportEmailPDF } from '../utils/pdfExport';

export default function ReportPreviewModal({
  isOpen,
  onClose,
  report,
  previewHtml = '',
  onConfirmSend = null,
  isSubmitting = false,
  managerEmail = ''
}) {
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'text'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const plainText = formatReportToPlainText(report);

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    await downloadReportEmailPDF(report);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/30 rounded-xl border border-emerald-400/30">
              <Mail className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white m-0">Live Report & Email Preview</h2>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded font-semibold border border-emerald-400/30">
                  Inbox Formatted
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 m-0">
                Delivering to: <span className="font-semibold text-white">{managerEmail || 'Manager Inbox'}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              HTML Email View
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Plain Text / WhatsApp View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {activeTab === 'email' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              {previewHtml ? (
                <div 
                  className="email-preview-wrapper"
                  dangerouslySetInnerHTML={{ __html: previewHtml }} 
                />
              ) : (
                /* Fallback Client Card View */
                <div className="p-6 space-y-6" id="report-preview-print-area">
                  
                  {/* Brand Header */}
                  <div className="bg-[#224938] text-white p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white m-0">GemRishi Team Work Report</h2>
                      <span className="text-xs text-emerald-200 uppercase tracking-widest font-medium">Daily Dispatch</span>
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold text-white">
                      Official
                    </span>
                  </div>

                  {/* Profile info */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase block">Employee</span>
                      <strong className="text-slate-800 text-base">{report.employeeName || 'Pawan Gangwar'}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase block">Department</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded border border-emerald-300">
                        {report.department || 'IT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase block">Date</span>
                      <strong className="text-slate-800">{report.reportDate}</strong>
                    </div>
                  </div>

                  {/* Targets */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                      🎯 Targets Planned ({report.targets?.length || 0})
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                      {report.targets?.map((t, i) => <li key={i} className="leading-relaxed">{t}</li>)}
                    </ul>
                  </div>

                  {/* Work Completed */}
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-100/30">
                    <h3 className="text-sm font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                      ✅ Work Completed ({report.workCompleted?.length || 0})
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-800 list-disc list-inside">
                      {report.workCompleted?.map((w, i) => <li key={i} className="leading-relaxed font-medium">{w}</li>)}
                    </ul>
                  </div>

                  {/* Results */}
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                    <h3 className="text-sm font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                      📊 Results ({report.results?.length || 0})
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                      {report.results?.map((r, i) => <li key={i} className="leading-relaxed">{r}</li>)}
                    </ul>
                  </div>

                  {/* Pending */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                    <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                      ⏳ Pending Tasks ({report.pendingTasks?.length || 0})
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                      {report.pendingTasks?.map((p, i) => <li key={i} className="leading-relaxed">{p}</li>)}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6">
              <pre className="font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {plainText}
              </pre>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Back to Edit
          </button>

          {onConfirmSend && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirmSend}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending to Mailbox...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit & Auto-Send Email
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
