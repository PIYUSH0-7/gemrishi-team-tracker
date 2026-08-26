import React, { useState } from 'react';
import { X, Sparkles, Clipboard, ArrowRight, Check } from 'lucide-react';
import { parseRawReport } from '../utils/parser';

export default function SmartPasteModal({ isOpen, onClose, onImport }) {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  if (!isOpen) return null;

  const sampleTemplate = `*WORK REPORT*

*Name: Piyush Gangwar*
*Department: IT*
*Date: 25 August 2026*

*Targets*
* Implement backend API endpoints for dynamic slug connection
* Review and update the Product & Jewellery data models
* Clean controller files to match the new schema structure
* Check Google Merchant Center and Search Console for indexing issues

*Work Completed*
* Investigated and set up the slug connection backend structure
* Updated Product Controller and Jewellery Controller logic
* Reviewed Model files and updated required fields
* Inspected Search Console reports and resolved pending crawl warnings

*Results*
* Slug routing is tested and working properly
* Controller and model files updated without any runtime errors
* Merchant Center feed verified and clean

*Pending Tasks*
* Complete final integration testing for dynamic slugs
* Finish remaining updates in Product controllers`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-emerald-500/30 rounded-xl border border-emerald-400/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white m-0">Smart Paste & Import</h2>
              <p className="text-2xs sm:text-xs text-emerald-200/80 m-0">Paste raw notes, WhatsApp text, or updates</p>
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
              Paste text here:
            </span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-2xs sm:text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Clipboard className="w-3 h-3" />
              Load Sample Text
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={8}
            placeholder={`Paste any text, notes, or bullet points here...\n\nExample:\nName: Piyush Gangwar\nDepartment: IT\nTargets: Finish dynamic slug routing\nCompleted: Investigated backend and fixed controller bugs\nResults: Slugs working\nPending: Final QA testing tomorrow`}
            className="w-full text-xs sm:text-sm p-3 sm:p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900 leading-relaxed resize-y font-sans"
          />

          {/* Real-time Parsed Summary Badge */}
          {parsedPreview && (
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <Check className="w-4 h-4 text-emerald-600" />
                Parsed & Ready to Import:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs sm:text-xs">
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Employee</span>
                  <span className="font-bold text-slate-800 truncate block">{parsedPreview.employeeName || '(Not specified)'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Department</span>
                  <span className="font-bold text-slate-800 truncate block">{parsedPreview.department || 'IT'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Targets</span>
                  <span className="font-bold text-emerald-700">{parsedPreview.targets?.length || 0} items</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-slate-500 block text-2xs">Completed</span>
                  <span className="font-bold text-emerald-700">{parsedPreview.workCompleted?.length || 0} items</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!rawText.trim()}
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
