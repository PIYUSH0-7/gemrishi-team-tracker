import React, { useState } from 'react';
import { X, Sparkles, Clipboard, ArrowRight, Check } from 'lucide-react';
import { parseRawReport } from '../utils/parser';

export default function SmartPasteModal({ isOpen, onClose, onImport }) {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  if (!isOpen) return null;

  const sampleTemplate = `*WORK REPORT*

*Name: Pawan Gangwar*
*Department: IT*
*Date: 25 August 2026*

*Targets*
* Implement the backend architecture required for Slug Connection.
* Update and review the Product Model and Jewellery Model.
* Review and update the Product Controller and Jewellery Controller files.
* Clean and update the controller files according to the required model structure.
* Check Google Merchant Center and Google Search Console for issues requiring attention.

*Work Completed*
* Investigated the backend architecture required for the Slug Connection.
* Reviewed the existing Controller files and identified the files requiring changes.
* Reviewed the Model files and identified the required updates.
* Prepared the backend architecture required for implementing the slug connection.
* Reviewed the Product Controller and Jewellery Controller files for required modifications.
* Checked Google Merchant Center and Google Search Console to identify areas requiring attention.

*Results*
* The backend structure required for the Slug Connection was investigated and prepared.
* Required Controller and Model files were reviewed to identify necessary changes.
* Admin architecture and related product jewellery pages were reviewed.
* Google Merchant Center and Google Search Console were checked for issues requiring further attention.

*Pending Tasks*
* Complete the implementation of the dynamic Slug Connection.
* Complete the required updates in the Product .`;

  const handleTextChange = (text) => {
    setRawText(text);
    if (text.trim()) {
      const parsed = parseRawReport(text);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleLoadSample = () => {
    handleTextChange(sampleTemplate);
  };

  const handleApply = () => {
    if (!rawText.trim()) return;
    const parsed = parseRawReport(rawText);
    if (parsed) {
      onImport(parsed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/30 rounded-xl border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Smart Paste & Quick Import</h2>
              <p className="text-xs text-emerald-200/80 m-0">Paste your WhatsApp/Slack notes or bullet list and auto-fill the form</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Paste Your Work Notes / Raw Report Here:
            </span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Load Sample Template
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={10}
            placeholder={`Paste your report text here...\n\nExample:\n*WORK REPORT*\n*Name: Pawan Gangwar*\n*Department: IT*\n*Targets*\n* Target 1\n*Work Completed*\n* Task completed 1\n*Results*\n* Result 1\n*Pending Tasks*\n* Pending 1`}
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900 leading-relaxed resize-y"
          />

          {/* Real-time Parsed Summary Badge */}
          {parsedPreview && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                Smart Parser Detected:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Employee</span>
                  <span className="font-bold text-slate-800 truncate block">{parsedPreview.employeeName || '(Unspecified)'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Department</span>
                  <span className="font-bold text-slate-800 truncate block">{parsedPreview.department || '(Unspecified)'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Targets</span>
                  <span className="font-bold text-emerald-700">{parsedPreview.targets?.length || 0} items</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Work Done</span>
                  <span className="font-bold text-emerald-700">{parsedPreview.workCompleted?.length || 0} items</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!rawText.trim()}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Auto-Fill Form
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
