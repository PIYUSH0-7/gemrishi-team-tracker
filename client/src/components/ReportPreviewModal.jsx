import React, { useState } from 'react';
import { X, Mail, Copy, Check, Printer, FileText, Send } from 'lucide-react';
import { formatReportToPlainText } from '../utils/parser';
import { downloadReportEmailPDF } from '../utils/pdfExport';
import { generateClientEmailHTML } from '../utils/emailTemplate';

export default function ReportPreviewModal({
  isOpen,
  onClose,
  report,
  previewHtml = '',
  onConfirmSend = null,
  isSubmitting = false,
  managerEmail = '',
  branding = null
}) {
  const [activeTab, setActiveTab] = useState('email');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !report) return null;

  const companyName = branding?.companyName || 'GemRishi';
  const brandColor = branding?.brandColor || '#224938';
  const plainText = formatReportToPlainText(report);
  
  // Always ensure rich HTML email template
  const activeHtml = previewHtml || generateClientEmailHTML(report, branding);

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadReportEmailPDF(report, branding);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div 
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-white transition-colors duration-300"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl border border-white/20">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white m-0">{companyName} Report Preview</h2>
              <p className="text-2xs sm:text-xs text-white/80 m-0 truncate max-w-[200px] sm:max-w-md">
                Recipient: <span className="font-semibold text-white">{managerEmail || 'pawan@gemrishi.com'}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-100 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-2xs sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3 h-3" />
              Email View
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-2xs sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3 h-3" />
              Plain Text
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 text-2xs sm:text-xs px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 text-2xs sm:text-xs px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
              title="Download exact 1-page PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3 h-3 text-slate-700" />
                  <span>Download 1-Page PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
          
          {activeTab === 'email' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <div 
                className="email-preview-wrapper p-2 sm:p-4"
                dangerouslySetInnerHTML={{ __html: activeHtml }} 
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
              <pre className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 font-mono">
                {plainText}
              </pre>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-slate-200 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Back to Edit
          </button>

          {onConfirmSend && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirmSend}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit & Send</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
