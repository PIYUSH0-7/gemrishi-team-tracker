import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import BrandCustomizationModal from './components/BrandCustomizationModal';
import Toast from './components/Toast';

export default function App() {
  const [managerEmail, setManagerEmail] = useState('');
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('gemrishi_branding');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      companyName: 'GemRishi',
      companyLogo: '',
      brandColor: '#224938',
      brandSecondaryColor: '#059669'
    };
  });

  const [isSecretBrandingOpen, setIsSecretBrandingOpen] = useState(false);

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
  const [adminTab, setAdminTab] = useState('dashboard');

  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ message, type, duration });
  };

  // Save branding updates
  const handleSaveBranding = (newBranding) => {
    setBranding(newBranding);
    try {
      localStorage.setItem('gemrishi_branding', JSON.stringify(newBranding));
    } catch (e) {}
  };

  // Initial load: fetch settings and departments
  useEffect(() => {
    // 1. Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.managerEmail) setManagerEmail(data.managerEmail);
          
          if (data.companyName || data.brandColor || data.companyLogo) {
            const serverBranding = {
              companyName: data.companyName || 'GemRishi',
              companyLogo: data.companyLogo || '',
              brandColor: data.brandColor || '#224938',
              brandSecondaryColor: data.brandSecondaryColor || '#059669'
            };
            setBranding(serverBranding);
            try {
              localStorage.setItem('gemrishi_branding', JSON.stringify(serverBranding));
            } catch (e) {}
          }
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
    // Report submitted successfully
  };

  const handleSettingsUpdated = (newSettings) => {
    if (newSettings && newSettings.managerEmail) {
      setManagerEmail(newSettings.managerEmail);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header with 7-Click Secret Trigger */}
      <Header 
        branding={branding} 
        onOpenSecretBranding={() => setIsSecretBrandingOpen(true)} 
      />

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
            branding={branding}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{branding.companyName} Team Work Tracker</span>
            <span>&bull;</span>
            <span>Automated Daily Report Dispatch</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Whitelabel Ready</span>
            <span>&bull;</span>
            <span>v1.2.0</span>
          </div>
        </div>
      </footer>

      {/* Secret Whitelabel Customization Modal (Triggered by 7 clicks on logo) */}
      <BrandCustomizationModal
        isOpen={isSecretBrandingOpen}
        onClose={() => setIsSecretBrandingOpen(false)}
        branding={branding}
        onSaveBranding={handleSaveBranding}
        showToast={showToast}
      />

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
