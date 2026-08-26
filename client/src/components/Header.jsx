import React, { useState, useRef } from 'react';
import { Calendar, Sparkles } from 'lucide-react';

export default function Header({ branding, onOpenSecretBranding }) {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const companyName = branding?.companyName || 'GemRishi';
  const companyLogo = branding?.companyLogo || '';
  const brandColor = branding?.brandColor || '#224938';

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Reset if user stops clicking for 3 seconds
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);

    if (newCount >= 7) {
      setClickCount(0);
      if (onOpenSecretBranding) {
        onOpenSecretBranding();
      }
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 text-white shadow-md border-b border-black/10 transition-colors duration-300"
      style={{ backgroundColor: brandColor }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Secret 7-Click Company Brand & Logo */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer select-none group relative"
            title="Click to customize brand (Secret 7 clicks)"
          >
            <div className="bg-white/15 hover:bg-white/25 p-1.5 sm:p-2 rounded-xl border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all transform group-active:scale-95 shadow-xs">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={companyName} 
                  className="h-6 sm:h-8 w-auto max-w-[120px] object-contain filter brightness-0 invert" 
                />
              ) : (
                <img 
                  src="/GemRishi.svg" 
                  alt="Logo" 
                  className="h-6 sm:h-8 w-auto filter brightness-0 invert"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              )}
              <span className="hidden text-base sm:text-xl font-bold tracking-wider text-white">
                {companyName.toUpperCase()}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white m-0">
                  {companyName} Work Tracker
                </h1>
                <span className="bg-white/20 text-white text-2xs px-2 py-0.5 rounded-full font-bold border border-white/20">
                  Daily
                </span>
                
                {/* Secret click progress indicator (subtle) */}
                {clickCount > 2 && clickCount < 7 && (
                  <span className="bg-amber-400 text-amber-950 text-2xs px-1.5 py-0.2 rounded-full font-extrabold animate-bounce">
                    {7 - clickCount}
                  </span>
                )}
              </div>
              <p className="text-2xs sm:text-xs text-white/80 m-0 font-medium hidden sm:block">
                Daily Report & Automated Email Dispatch Portal
              </p>
            </div>
          </div>

          {/* Header Right: Today's Date */}
          <div className="flex items-center">
            <div className="flex items-center gap-1 text-2xs sm:text-xs text-white bg-black/20 px-2.5 py-1.5 rounded-xl border border-white/20 shadow-2xs">
              <Calendar className="w-3 h-3 text-white/80" />
              <span className="font-semibold">{today}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
