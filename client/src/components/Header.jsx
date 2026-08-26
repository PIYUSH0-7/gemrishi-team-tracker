import React from 'react';
import { Calendar } from 'lucide-react';

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-40 bg-[#1b3d2f] text-white border-b border-[#132a20] shadow-md">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Company Brand & Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-xl border border-emerald-400/20 backdrop-blur-sm flex items-center justify-center">
              <img 
                src="/GemRishi.svg" 
                alt="GemRishi" 
                className="h-6 sm:h-8 w-auto filter brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-base sm:text-xl font-bold tracking-wider text-emerald-400">GEMRISHI</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white m-0">Team Work Tracker</h1>
                <span className="bg-emerald-500/30 text-emerald-300 text-2xs px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  Daily
                </span>
              </div>
              <p className="text-2xs sm:text-xs text-emerald-200/80 m-0 font-medium hidden sm:block">Employee Daily Report Submission Portal</p>
            </div>
          </div>

          {/* Header Right: Today's Date */}
          <div className="flex items-center">
            <div className="flex items-center gap-1 text-2xs sm:text-xs text-emerald-100 bg-emerald-950/50 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 shadow-2xs">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">{today}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
