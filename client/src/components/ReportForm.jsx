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

export default function ReportForm({ onReportSubmitted, showToast, managerEmail, departments = [], branding = null }) {
  // Form State - initially completely empty until typed or "Load Sample" is clicked
  const [employeeName, setEmployeeName] = useState(() => localStorage.getItem('gemrishi_employee_name') || '');
  const [department, setDepartment] = useState(() => localStorage.getItem('gemrishi_department') || (departments[0] || 'IT'));
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [targets, setTargets] = useState(['']);
  const [workCompleted, setWorkCompleted] = useState(['']);
  const [results, setResults] = useState(['']);
  const [pendingTasks, setPendingTasks] = useState(['']);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track active keyboard typing to auto-hide the bottom action bar
  const [isTyping, setIsTyping] = useState(false);

  // Auto-save employee name & department to localStorage
  useEffect(() => {
    if (employeeName) localStorage.setItem('gemrishi_employee_name', employeeName);
  }, [employeeName]);

  useEffect(() => {
    if (department) localStorage.setItem('gemrishi_department', department);
  }, [department]);

  const handleInputFocus = () => {
    setIsTyping(true);
  };

  const handleInputBlur = () => {
    // Delay slight blur to allow taps on buttons
    setTimeout(() => {
      setIsTyping(false);
    }, 200);
  };

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

    showToast('Report parsed and populated!', 'success');
  };

  // Load natural, human sample report
  const handleLoadSample = () => {
    setEmployeeName('Piyush Gangwar');
    setDepartment('IT');
    setReportDate(new Date().toISOString().split('T')[0]);
    setTargets([
      'Implement backend API endpoints for the dynamic slug connection',
      'Review and update the Product & Jewellery data models',
      'Clean controller files to match the new schema structure',
      'Check Google Merchant Center and Search Console for indexing issues'
    ]);
    setWorkCompleted([
      'Investigated and set up the slug connection backend structure',
      'Updated Product Controller and Jewellery Controller logic',
      'Reviewed Model files and updated required fields',
      'Inspected Search Console reports and resolved pending crawl warnings'
    ]);
    setResults([
      'Slug routing is tested and working properly',
      'Controller and model files updated without any runtime errors',
      'Merchant Center feed verified and clean'
    ]);
    setPendingTasks([
      'Complete final integration testing for dynamic slugs',
      'Finish remaining updates in Product controllers'
    ]);
    setNotes('');
    showToast('Loaded sample report!', 'success');
  };

  const brandColor = branding?.brandColor || '#224938';
  const brandSecondaryColor = branding?.brandSecondaryColor || '#059669';

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
      notes,
      branding
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

  // Submit Report & Dispatch Email to Manager
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!employeeName.trim()) {
      showToast('Please enter your Name', 'error');
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

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      const data = await res.json();

      if (res.ok) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#34d399', '#224938', '#fbbf24']
          });
        } catch (e) {}

        if (data.emailResult?.success && !data.emailResult?.previewOnly) {
          showToast(`✅ Work Report submitted and emailed to ${data.emailResult.recipient}!`, 'success', 6000);
        } else if (data.emailResult?.previewOnly) {
          showToast(`⚠️ Report saved! To deliver emails, add your Gmail & App Password in server/config.js`, 'error', 9000);
        } else if (data.emailResult?.error) {
          showToast(`⚠️ Email notice: ${data.emailResult.error}`, 'error', 9000);
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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-28 sm:pb-32">
      
      {/* Top Banner - Dynamic Brand Colors */}
      <div 
        className="mb-5 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-black/10 relative overflow-hidden transition-all duration-300"
        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandSecondaryColor} 100%)` }}
      >
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-white/20 text-white text-2xs sm:text-xs font-bold uppercase tracking-wider rounded-full border border-white/20">
                Daily Work Report
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white m-0">
              Submit Today's Work Report
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-lg leading-relaxed">
              Fill in your tasks, completed work, and updates. Your report will be automatically emailed to the manager.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSmartPasteOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs border border-white/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Smart Paste</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        
        {/* Profile Card: Name, Department, Date */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Employee Name */}
            <div>
              <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Employee Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm cursor-pointer"
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
              <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Report Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base sm:text-sm cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* 1. Targets Planned */}
        <BulletListInput
          title="Targets for Today"
          icon={TrendingUp}
          items={targets}
          setItems={setTargets}
          placeholder="What did you plan to work on today?"
          accentColor="emerald"
          onMoveToCompleted={handleMoveTargetToCompleted}
          moveToLabel="Done"
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
        />

        {/* 2. Work Completed */}
        <BulletListInput
          title="Work Completed"
          icon={FileCheck}
          items={workCompleted}
          setItems={setWorkCompleted}
          placeholder="What tasks or updates did you finish today?"
          accentColor="emerald"
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
        />

        {/* 3. Results & Key Outcomes */}
        <BulletListInput
          title="Results & Key Findings"
          icon={Sparkles}
          items={results}
          setItems={setResults}
          placeholder="What was the result or outcome of your work?"
          accentColor="teal"
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
        />

        {/* 4. Pending Tasks */}
        <BulletListInput
          title="Pending Tasks"
          icon={Clock}
          items={pendingTasks}
          setItems={setPendingTasks}
          placeholder="What tasks are remaining or planned for tomorrow?"
          accentColor="amber"
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
        />

        {/* 5. Additional Notes (Optional) */}
        <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Additional Notes / Comments (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            rows={2}
            placeholder="Any blockers, questions, or extra comments..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-y"
          />
        </div>

        {/* Fixed Docked Bottom Action Bar - Automatically HIDES when typing! */}
        <div 
          className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white px-3 sm:px-6 py-2.5 sm:py-3.5 border-t border-slate-800 shadow-2xl transition-all duration-200 ease-in-out ${
            isTyping ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4">
            
            {/* 1. Preview Email Button */}
            <button
              type="button"
              onClick={handleOpenPreview}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl border border-slate-600 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Preview Email</span>
            </button>

            {/* 2. Submit & Auto Send Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 sm:px-8 py-2.5 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:brightness-95"
              style={{ background: `linear-gradient(to right, ${brandColor}, ${brandSecondaryColor})` }}
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
        branding={branding}
      />

    </div>
  );
}
