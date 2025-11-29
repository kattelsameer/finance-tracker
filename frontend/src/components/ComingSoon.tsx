import { Construction, Clock, Sparkles, ArrowRight, type LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export function ComingSoon({ title, description, icon: Icon = Construction, features }: Readonly<ComingSoonProps>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-lg w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
              <Icon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          
          {/* Description */}
          <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>

        {/* Feature list */}
        {features && features.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Coming Features
            </h3>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-amber-700">In Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
