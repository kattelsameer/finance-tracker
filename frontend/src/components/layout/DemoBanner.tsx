import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

/**
 * DemoBanner component
 * Displays a prominent banner when running in demo mode
 * Shows demo credentials and data reset information
 */
export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  
  // Don't render if not in demo mode or if dismissed
  if (!isDemoMode || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-300 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 mb-0.5">
              🎭 Demo Mode Active
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="inline-flex items-center gap-2 flex-wrap">
                <span>
                  Login: <strong className="font-mono bg-amber-200/50 px-1.5 py-0.5 rounded">demo@example.com</strong>
                </span>
                <span className="text-amber-500">•</span>
                <span>
                  Password: <strong className="font-mono bg-amber-200/50 px-1.5 py-0.5 rounded">Demo123!</strong>
                </span>
                <span className="text-amber-500">•</span>
                <span className="text-amber-600">
                  Data resets daily at 2:00 AM UTC
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/register"
            className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 bg-white hover:bg-amber-50 border border-amber-300 rounded-md transition-colors duration-200"
          >
            Create Real Account →
          </a>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-amber-600 hover:text-amber-900 hover:bg-amber-200/50 rounded transition-colors duration-200"
            aria-label="Dismiss demo banner"
            title="Dismiss (will reappear on refresh)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
