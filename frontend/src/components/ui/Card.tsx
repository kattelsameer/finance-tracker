import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick 
}: Readonly<CardProps>) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${paddings[padding]}
        ${hover ? 'transition-shadow hover:shadow-md' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = '', action }: Readonly<CardHeaderProps>) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {typeof children === 'string' ? (
        <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
      ) : (
        children
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: Readonly<CardContentProps>) {
  return <div className={className}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: Readonly<CardFooterProps>) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
