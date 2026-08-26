import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Sparkles, 
  Eye, 
  Clipboard, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  FileCheck, 
  Clock, 
  TrendingUp
} from 'lucide-react';
import BulletListInput from './BulletListInput';
import SmartPasteModal from './SmartPasteModal';
import ReportPreviewModal from './ReportPreviewModal';
import { downloadReportEmailPDF } from '../utils/pdfExport';

export default function ReportForm({ onReportSubmitted, showToast, managerEmail, departments = [] }) {
  // Form State - initially empty until user inputs or clicks "Load Sample"
  const [employeeName, setEmployeeName] = useState(() => localStorage.getItem('gemrishi_employee_name') || '');
  const [department, setDepartment] = useState(() => localStorage.getItem('gemrishi_department') || (departments[0] || 'IT'));
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [targets, setTargets] = useState(['']);
  const [workCompleted, setWorkCompleted] = useState(['']);
  const [results, setResults] = useState(['']);
  const [pendingTasks, setPendingTasks] = useState(['']);
  const [notes, setNotes] = useState('');

  // Modals & UI state
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save employee name & department to localStorage
  useEffect(() => {
    if (employeeName) localStorage.setItem('gemrishi_employee_name', employeeName);
  }, [employeeName]);

  useEffect(() => {
    if (department) localStorage.setItem('gemrishi_department', department);
  }, [department]);

  // Handler to move a Target into Work Completed
  const handleMoveTargetToCompleted = (targetIndex) => {
    const item = targets[targetIndex];
    if (!item || !item.trim()) return;

    if (!workCompleted.includes(item)) {
      if (workCompleted.length === 1 && !workCompleted[0].trim()) {
        setWorkCompleted([item]);
      } else {
        setWorkCompleted([...workCompleted, item]);
      }
    }

    showToast(`Added to Work Completed!`, 'info');
  };

  // Smart Paste Import Handler
  const handleSmartImport = (parsed) => {
    if (parsed.employeeName) setEmployeeName(parsed.employeeName);
    if (parsed.department) setDepartment(parsed.department);
    if (parsed.reportDate) setReportDate(parsed.reportDate);
    if (parsed.targets?.length) setTargets(parsed.targets);
    if (parsed.workCompleted?.length) setWorkCompleted(parsed.workCompleted);
    if (parsed.results?.length) setResults(parsed.results);
    if (parsed.pendingTasks?.length) setPendingTasks(parsed.pendingTasks);
    if (parsed.notes) setNotes(parsed.notes);

    showToast('Report parsed and populated successfully!', 'success');
  };

  // Load sample report ONLY on clicking "Load Sample"
  const handleLoadSample = () => {
    setEmployeeName('Pawan Gangwar');
    setDepartment('IT');
    setReportDate(new Date().toISOString().split('T')[0]);
    setTargets([
      'Implement the backend architecture required for Slug Connection.',
      'Update and review the Product Model and Jewellery Model.',
      'Review and update the Product Controller and Jewellery Controller files.',
      'Clean and update the controller files according to the required model structure.',
      'Check Google Merchant Center and Google Search Console for issues requiring attention.'
    ]);
    setWorkCompleted([
      'Investigated the backend architecture required for the Slug Connection.',
      'Reviewed the existing Controller files and identified the files requiring changes.',
      'Reviewed the Model files and identified the required updates.',
      'Prepared the backend architecture required for implementing the slug connection.',
      'Reviewed the Product Controller and Jewellery Controller files for required modifications.',
      'Checked Google Merchant Center and Google Search Console to identify areas requiring attention.'
    ]);
    setResults([
      'The backend structure required for the Slug Connection was investigated and prepared.',
      'Required Controller and Model files were reviewed to identify necessary changes.',
      'Admin architecture and related product jewellery pages were reviewed.',
      'Google Merchant Center and Google Search Console were checked for issues requiring further attention.'
    ]);
    setPendingTasks([
      'Complete the implementation of the dynamic Slug Connection.',
      'Complete the required updates in the Product .'
    ]);
    setNotes('');
    showToast('Loaded sample report template!', 'success');
  };

  // Live preview generator
  const handleOpenPreview = async () => {
    const reportPayload = {
      employeeName,
      department,
      reportDate,
      targets: targets.filter(t => t.trim()),
      workCompleted: workCompleted.filter(w => w.trim()),
      results: results.filter(r => r.trim()),
      pendingTasks: pendingTasks.filter(p => p.trim()),
      notes
    };

    try {
      const res = await fetch('/api/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });
      const data = await res.json();
      setPreviewHtml(data.html || '');
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Preview error:', err);
      setIsPreviewOpen(true);
    }
  };

  // Submit Report, Auto-Dispatch Email, and Auto-Download PDF in the exact HTML email format
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!employeeName.trim()) {
      showToast('Please enter your Employee Name', 'error');
      return;
    }

    const cleanTargets = targets.filter(t => t.trim());
    const cleanCompleted = workCompleted.filter(w => w.trim());
    const cleanResults = results.filter(r => r.trim());
    const cleanPending = pendingTasks.filter(p => p.trim());

    if (cleanCompleted.length === 0 && cleanTargets.length === 0) {
      showToast('Please enter at least one target or completed task', 'error');
      return;
    }

    setIsSubmitting(true);

    const reportData = {
      employeeName: employeeName.trim(),
      department: department.trim(),
      reportDate,
      targets: cleanTargets,
      workCompleted: cleanCompleted,
      results: cleanResults,
      pendingTasks: cleanPending,
      notes: notes.trim()
    };

    // 1. Submit report and auto-send email to manager
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      const data = await res.json();

      if (res.ok) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#34d399', '#224938', '#fbbf24']
          });
        } catch (e) {}

        if (data.emailResult?.success && !data.emailResult?.previewOnly) {
          showToast(`✅ Report submitted & emailed to ${data.emailResult.recipient}!`, 'success', 6000);
        } else if (data.emailResult?.previewOnly) {
          showToast(`⚠️ Report saved! To deliver email directly to your inbox, enter your Gmail & App Password in server/config.js`, 'error', 9000);
        } else if (data.emailResult?.error) {
          showToast(`⚠️ Email delivery notice: ${data.emailResult.error}`, 'error', 9000);
        } else {
          showToast('✅ Work Report submitted successfully!', 'success');
        }

        if (onReportSubmitted) {
          onReportSubmitted(data.report);
        }

        setIsPreviewOpen(false);
      } else {
        showToast(data.error || 'Failed to submit report', 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Network error while submitting report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-32 sm:pb-36">
      
      {/* Top Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#1b3d2f] via-[#224938] to-[#065f46] text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-2xs sm:text-xs font-extrabold uppercase tracking-wider rounded-full border border-emerald-400/30">
                Daily Work Submission
              </span>
              <span className="text-2xs sm:text-xs text-emerald-200">Auto-Dispatched to Manager</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
              Submit Your Daily Work Report
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Fill in your targets, completed tasks, results, and pending work. Your report will be automatically formatted and emailed to the manager.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Smart Paste Button */}
            <button
              type="button"
              onClick={() => setIsSmartPasteOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Smart Paste</span>
            </button>

            {/* Load Sample Report */}
            <button
              type="button"
              onClick={handleLoadSample}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-emerald-100 hover:text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        
        {/* Profile Card: Name, Department, Date */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Employee Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Report Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* 1. Targets Planned */}
        <BulletListInput
          title="Targets Planned for Today"
          icon={TrendingUp}
          items={targets}
          setItems={setTargets}
          placeholder="e.g. Implement backend architecture"
          accentColor="emerald"
          onMoveToCompleted={handleMoveTargetToCompleted}
          moveToLabel="Done"
        />

        {/* 2. Work Completed */}
        <BulletListInput
          title="Work Completed"
          icon={FileCheck}
          items={workCompleted}
          setItems={setWorkCompleted}
          placeholder="e.g. Investigated backend architecture"
          accentColor="emerald"
        />

        {/* 3. Results & Key Outcomes */}
        <BulletListInput
          title="Results & Key Findings"
          icon={Sparkles}
          items={results}
          setItems={setResults}
          placeholder="e.g. Backend structure investigated and prepared"
          accentColor="teal"
        />

        {/* 4. Pending Tasks */}
        <BulletListInput
          title="Pending Tasks & Next Steps"
          icon={Clock}
          items={pendingTasks}
          setItems={setPendingTasks}
          placeholder="e.g. Complete dynamic connection"
          accentColor="amber"
        />

        {/* 5. Additional Notes (Optional) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Additional Notes / Comments (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional comments or notes..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-y"
          />
        </div>

        {/* Fixed Docked Bottom Action Bar for Mobile & Desktop */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 sm:py-4 border-t border-slate-800 shadow-2xl">
          <div className="max-w-5xl mx-auto flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4">
            
            {/* 1. Preview Email Button */}
            <button
              type="button"
              onClick={handleOpenPreview}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl border border-slate-600 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:border-emerald-400/50"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Preview Email</span>
            </button>

            {/* 2. Submit & Auto Send Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="truncate">Sending Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="truncate">Submit & Auto Send</span>
                </>
              )}
            </button>

          </div>
        </div>

      </form>

      {/* Smart Paste Modal */}
      <SmartPasteModal
        isOpen={isSmartPasteOpen}
        onClose={() => setIsSmartPasteOpen(false)}
        onImport={handleSmartImport}
      />

      {/* Live Email Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        report={{
          employeeName,
          department,
          reportDate,
          targets: targets.filter(t => t.trim()),
          workCompleted: workCompleted.filter(w => w.trim()),
          results: results.filter(r => r.trim()),
          pendingTasks: pendingTasks.filter(p => p.trim()),
          notes
        }}
        previewHtml={previewHtml}
        onConfirmSend={handleSubmit}
        isSubmitting={isSubmitting}
        managerEmail={managerEmail}
      />

    </div>
  );
}
