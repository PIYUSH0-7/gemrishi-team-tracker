import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send, 
  ShieldCheck, 
  Mail, 
  Server, 
  Lock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Building2,
  Sparkles
} from 'lucide-react';

export default function SettingsPanel({ onSettingsUpdated, showToast, departments = [], onAddDepartment, onDeleteDepartment }) {
  const [settings, setSettings] = useState({
    managerEmail: '',
    ccEmails: '',
    senderName: 'GemRishi Team Tracker',
    companyName: 'GemRishi',
    subjectPrefix: '[Daily Work Report]',
    autoEmailOnSubmit: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPass: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Preset selectors
  const applyPreset = (type) => {
    if (type === 'gmail') {
      setSettings(prev => ({
        ...prev,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: false
      }));
      showToast('Applied Gmail SMTP preset', 'info');
    } else if (type === 'outlook') {
      setSettings(prev => ({
        ...prev,
        smtpHost: 'smtp.office365.com',
        smtpPort: 587,
        smtpSecure: false
      }));
      showToast('Applied Outlook 365 preset', 'info');
    }
  };

  // Save settings
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!settings.managerEmail.trim()) {
      showToast('Manager Email is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        showToast('Settings saved successfully!', 'success');
        if (onSettingsUpdated) onSettingsUpdated(data.settings);
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Network error while saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP
  const handleTestEmail = async () => {
    if (!settings.smtpUser || !settings.smtpPass) {
      showToast('Please enter SMTP Username and Password/App Password first', 'error');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          testRecipient: settings.managerEmail
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Test email successfully delivered to ${settings.managerEmail}!`
        });
        showToast('✅ Test email sent successfully!', 'success');
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test email. Check your SMTP credentials.'
        });
        showToast('Test email failed', 'error');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Network error or server unreachable.'
      });
      showToast('Test email network error', 'error');
    } finally {
      setTesting(false);
    }
  };

  // Add Department
  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    onAddDepartment(newDeptName.trim());
    setNewDeptName('');
    showToast(`Added department "${newDeptName.trim()}"`, 'success');
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider rounded-full border border-emerald-400/30">
              Email & Automation Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
            Manager Email & Dispatch Settings
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1">
            Configure where employee work reports are delivered and connect your company email (Gmail, Google Workspace, Outlook, or SMTP).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Manager Recipient Email Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 m-0">Manager Recipient Mailbox</h2>
              <p className="text-xs text-slate-500 m-0">The target email address where all submitted employee daily reports will land</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Manager Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Manager / Reviewer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={settings.managerEmail}
                onChange={(e) => handleChange('managerEmail', e.target.value)}
                placeholder="e.g. manager@gemrishi.com or your-email@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Every report submitted by an employee will be sent directly here.
              </span>
            </div>

            {/* CC Emails */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                CC Email Addresses (Optional)
              </label>
              <input
                type="text"
                value={settings.ccEmails}
                onChange={(e) => handleChange('ccEmails', e.target.value)}
                placeholder="director@gemrishi.com, it-lead@gemrishi.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Separate multiple CC emails with commas.
              </span>
            </div>

            {/* Sender Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sender Display Name
              </label>
              <input
                type="text"
                value={settings.senderName}
                onChange={(e) => handleChange('senderName', e.target.value)}
                placeholder="GemRishi Team Tracker"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Subject Line Prefix */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subject Line Prefix
              </label>
              <input
                type="text"
                value={settings.subjectPrefix}
                onChange={(e) => handleChange('subjectPrefix', e.target.value)}
                placeholder="[Daily Work Report]"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Resulting subject: <code>{settings.subjectPrefix} Pawan Gangwar (IT) - 25 Aug 2026</code>
              </span>
            </div>

          </div>

          {/* Auto-email toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Auto-Dispatch Email on Employee Submit
              </span>
              <span className="text-xs text-slate-500 block">
                When enabled, whenever an employee hits "Submit", the formatted HTML email is sent instantly.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoEmailOnSubmit}
                onChange={(e) => handleChange('autoEmailOnSubmit', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

        </div>

        {/* Section 2: SMTP Outgoing Server Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 text-teal-800 rounded-2xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 m-0">SMTP Outgoing Mail Server</h2>
                <p className="text-xs text-slate-500 m-0">Connect Gmail or custom SMTP server to send reports</p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('gmail')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors"
              >
                Gmail / Google Workspace
              </button>
              <button
                type="button"
                onClick={() => applyPreset('outlook')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors"
              >
                Outlook 365
              </button>
            </div>
          </div>

          {/* Quick Help Card for Gmail App Passwords */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              How to send with Gmail / Google Workspace (Recommended):
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-emerald-900/90 pl-1 leading-relaxed">
              <li>Enter your Gmail / Google Workspace email in <strong>SMTP Username</strong> below.</li>
              <li>Go to your Google Account (<a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">myaccount.google.com/apppasswords</a>).</li>
              <li>Generate a 16-character <strong>App Password</strong> (e.g. <code>abcd efgh ijkl mnop</code>).</li>
              <li>Paste that 16-character password in the <strong>SMTP Password / App Password</strong> field below and click <strong>Test Email</strong>!</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SMTP Host */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SMTP Server Host
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SMTP Port
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleChange('smtpPort', e.target.value)}
                  placeholder="587"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) => handleChange('smtpSecure', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  SSL (Port 465)
                </label>
              </div>
            </div>

            {/* SMTP Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SMTP Username (Sender Email)
              </label>
              <input
                type="email"
                value={settings.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                placeholder="e.g. notifications@gemrishi.com or your-gmail@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* SMTP Password / App Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SMTP Password / Google App Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtpPass}
                  onChange={(e) => handleChange('smtpPass', e.target.value)}
                  placeholder="16-character App Password"
                  className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Connection Test Runner */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Verify your SMTP connection by sending a real GemRishi test report to <strong>{settings.managerEmail || 'your email'}</strong>.
            </div>

            <button
              type="button"
              disabled={testing}
              onClick={handleTestEmail}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#224938] hover:bg-[#1b3d2f] text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {testing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Send Test Work Report
                </>
              )}
            </button>
          </div>

          {/* Test Diagnostic Result Banner */}
          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block text-sm mb-0.5">
                  {testResult.success ? 'SMTP Connection Verified!' : 'SMTP Test Failed'}
                </span>
                <p className="m-0">{testResult.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Section 3: Company Departments Management */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 m-0">Company Departments</h2>
              <p className="text-xs text-slate-500 m-0">Manage the list of active departments available on the submission form</p>
            </div>
          </div>

          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {departments.map((dept) => (
              <div 
                key={dept} 
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <span>{dept}</span>
                {departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteDepartment(dept)}
                    title={`Delete ${dept}`}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Department Input */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Add new department (e.g. Quality Assurance, Gemology)..."
              className="max-w-md px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddDept}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Department
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
