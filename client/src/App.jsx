import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';

export default function App() {
  const [managerEmail, setManagerEmail] = useState('');
  const [departments, setDepartments] = useState([
    'IT',
    'Jewellery Design',
    'Production & Inventory',
    'Sales & Business Dev',
    'Digital Marketing',
    'Accounts & Finance',
    'Operations',
    'Human Resources',
    'Customer Support'
  ]);

  const [toast, setToast] = useState(null);

  // Check if admin mode is requested via URL query e.g. ?admin=true
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';
  const [adminTab, setAdminTab] = useState('dashboard'); // for admin mode only

  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ message, type, duration });
  };

  // Initial load: fetch settings and departments
  useEffect(() => {
    // 1. Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.managerEmail) {
          setManagerEmail(data.managerEmail);
        }
      })
      .catch(err => console.log('Init settings fetch note:', err.message));

    // 2. Fetch departments
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
        }
      })
      .catch(err => console.log('Init departments fetch note:', err.message));
  }, []);

  const handleAddDepartment = async (name) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to add department:', err);
    }
  };

  const handleDeleteDepartment = (name) => {
    setDepartments(prev => prev.filter(d => d !== name));
  };

  const handleReportSubmitted = () => {
    // Keep user on the form or give options
  };

  const handleSettingsUpdated = (newSettings) => {
    if (newSettings && newSettings.managerEmail) {
      setManagerEmail(newSettings.managerEmail);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Emerald Header */}
      <Header />

      {/* Admin navigation toolbar ONLY if ?admin=true is present */}
      {isAdmin && (
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300">⚙️ Manager Admin Mode Active</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('form')}
              className={`px-2.5 py-1 rounded ${adminTab === 'form' ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              Employee Form
            </button>
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`px-2.5 py-1 rounded ${adminTab === 'dashboard' ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              Manager Dashboard
            </button>
            <button
              onClick={() => setAdminTab('settings')}
              className={`px-2.5 py-1 rounded ${adminTab === 'settings' ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1">
        {(!isAdmin || adminTab === 'form') && (
          <ReportForm
            onReportSubmitted={handleReportSubmitted}
            showToast={showToast}
            managerEmail={managerEmail}
            departments={departments}
          />
        )}

        {isAdmin && adminTab === 'dashboard' && (
          <Dashboard
            onNewReportClick={() => setAdminTab('form')}
            showToast={showToast}
            departments={departments}
          />
        )}

        {isAdmin && adminTab === 'settings' && (
          <SettingsPanel
            onSettingsUpdated={handleSettingsUpdated}
            showToast={showToast}
            departments={departments}
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">GemRishi Team Work Tracker</span>
            <span>&bull;</span>
            <span>Automated Daily Report Dispatch</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Emerald Green Theme</span>
            <span>&bull;</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Popup */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
