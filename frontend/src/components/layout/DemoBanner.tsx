import React, { useState } from 'react';
import { AlertCircle, X, Info } from 'lucide-react';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (!isDemoMode || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm w-[calc(100%-3rem)] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-amber-200 overflow-hidden animate-slide-up transition-all duration-300">
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-900 tracking-wide">Demo Environment</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-amber-500 hover:text-amber-700 hover:bg-amber-200/50 p-1 rounded-md transition-colors"
          aria-label="Close demo alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 text-sm text-gray-600">
        <p className="mb-3 leading-relaxed">
          You are currently exploring a read-only demo instance. Feel free to poke around!
        </p>
        
        <div className="flex items-start gap-2 text-xs text-amber-700 mb-4 bg-amber-50/50 p-2.5 rounded-lg">
          <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p>Database automatically resets every day at <strong className="font-semibold text-amber-900">2:00 AM UTC</strong>.</p>
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="w-full flex items-center justify-center py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow hover:shadow-md font-medium rounded-lg transition-all active:scale-[0.98]"
        >
          Got it, continue exploring
        </button>
      </div>
    </div>
  );
}
