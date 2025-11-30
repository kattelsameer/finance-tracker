import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  onClose,
  className = '' 
}: Readonly<AlertProps>) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-800',
      Icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-800',
      Icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
      Icon: XCircle,
    },
  };
  
  const config = variants[variant];
  const Icon = config.Icon;
  
  return (
    <div
      className={`
        ${config.bg} ${config.border} border rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${config.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.text}`}>
            {children}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors ${config.icon}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
