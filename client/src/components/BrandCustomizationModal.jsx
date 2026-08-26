import React, { useState, useRef } from 'react';
import { X, Sparkles, Upload, RotateCcw, Check, Palette, Building2, Image } from 'lucide-react';

const PRESET_PALETTES = [
  {
    name: 'Emerald Green',
    primary: '#224938',
    secondary: '#059669',
    preview: 'from-[#1b3d2f] to-[#059669]'
  },
  {
    name: 'Royal Blue',
    primary: '#1e3a8a',
    secondary: '#2563eb',
    preview: 'from-[#172554] to-[#2563eb]'
  },
  {
    name: 'Deep Purple',
    primary: '#4c1d95',
    secondary: '#7c3aed',
    preview: 'from-[#2e1065] to-[#7c3aed]'
  },
  {
    name: 'Crimson Ruby',
    primary: '#881337',
    secondary: '#e11d48',
    preview: 'from-[#4c0519] to-[#e11d48]'
  },
  {
    name: 'Amber Gold',
    primary: '#78350f',
    secondary: '#d97706',
    preview: 'from-[#451a03] to-[#d97706]'
  },
  {
    name: 'Onyx Slate',
    primary: '#0f172a',
    secondary: '#475569',
    preview: 'from-[#020617] to-[#475569]'
  }
];

export default function BrandCustomizationModal({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
  showToast
}) {
  const [companyName, setCompanyName] = useState(branding.companyName || 'GemRishi');
  const [companyLogo, setCompanyLogo] = useState(branding.companyLogo || '');
  const [brandColor, setBrandColor] = useState(branding.brandColor || '#224938');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(branding.brandSecondaryColor || '#059669');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Please upload an image smaller than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyLogo(event.target.result);
      showToast('Logo loaded! Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setBrandColor(preset.primary);
    setBrandSecondaryColor(preset.secondary);
  };

  const handleResetDefaults = () => {
    setCompanyName('GemRishi');
    setCompanyLogo('');
    setBrandColor('#224938');
    setBrandSecondaryColor('#059669');
    showToast('Reset to GemRishi default branding', 'info');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updated = {
      companyName: companyName.trim() || 'GemRishi',
      companyLogo,
      brandColor,
      brandSecondaryColor
    };

    try {
      // 1. Save to server settings
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: updated.companyName,
          companyLogo: updated.companyLogo,
          brandColor: updated.brandColor,
          brandSecondaryColor: updated.brandSecondaryColor
        })
      });

      // 2. Call parent callback to update React state & localStorage
      onSaveBranding(updated);
      showToast('🎉 Brand settings saved and applied everywhere!', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to save branding:', err);
      showToast('Error saving branding settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div 
          className="px-5 py-4 text-white flex items-center justify-between transition-colors duration-300"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white m-0">Whitelabel Brand Settings</h2>
                <span className="bg-amber-400 text-amber-950 text-2xs px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Secret
                </span>
              </div>
              <p className="text-2xs sm:text-xs text-white/80 m-0">Customize company name, logo & email brand color</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* 1. Company Name */}
          <div>
            <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp / GemRishi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
            />
          </div>

          {/* 2. Upload Custom Company Logo */}
          <div>
            <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-slate-500" />
              Company Logo (SVG / PNG / JPG)
            </label>
            
            <div className="flex items-center gap-3">
              {/* Logo Preview Box */}
              <div className="w-24 h-16 rounded-xl border border-slate-300 bg-slate-900 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-0 invert" />
                ) : (
                  <img src="/GemRishi.svg" alt="Default Logo" className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-60" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {companyLogo ? 'Change Logo Image' : 'Upload Company Logo'}
                </button>

                {companyLogo && (
                  <button
                    type="button"
                    onClick={() => setCompanyLogo('')}
                    className="text-2xs text-rose-600 hover:text-rose-800 font-semibold block text-center w-full"
                  >
                    Remove custom logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Brand Color Palette Selection */}
          <div>
            <label className="block text-2xs sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              Theme Brand Color
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_PALETTES.map((preset) => {
                const isSelected = brandColor.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`h-4 rounded-lg bg-gradient-to-r ${preset.preview} shadow-2xs`} />
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-bold text-slate-800 truncate">{preset.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-slate-900 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Pickers */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <div>
                  <span className="text-2xs text-slate-500 block font-semibold">Primary Brand Hex</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{brandColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandSecondaryColor}
                  onChange={(e) => setBrandSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <div>
                  <span className="text-2xs text-slate-500 block font-semibold">Accent Hex</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{brandSecondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl text-white shadow-md relative overflow-hidden" style={{ backgroundColor: brandColor }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xs uppercase tracking-wider text-white/80 font-bold">Email & Header Preview</span>
                <h4 className="text-base font-extrabold text-white m-0">{companyName || 'GemRishi'}</h4>
              </div>
              <span className="text-2xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Daily Report
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save & Apply Brand'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
