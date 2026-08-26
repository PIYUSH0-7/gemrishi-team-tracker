import React from 'react';
import { Calendar, FileEdit } from 'lucide-react';

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-40 bg-[#1b3d2f] text-white border-b border-[#132a20] shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Company Brand & Logo */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-2 rounded-xl border border-emerald-400/20 backdrop-blur-sm flex items-center justify-center">
              <img 
                src="/GemRishi.svg" 
                alt="GemRishi" 
                className="h-9 w-auto filter brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-xl font-bold tracking-wider text-emerald-400">GEMRISHI</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white m-0">Team Work Tracker</h1>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  Daily Dispatch
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 m-0 font-medium">Official Daily Employee Report Submission Portal</p>
            </div>
          </div>

          {/* Header Right: Today's Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-100/90 bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-500/20 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{today}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
