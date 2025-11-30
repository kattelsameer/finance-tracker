import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: Readonly<SpinnerProps>) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <Loader2 className={`animate-spin text-blue-600 ${sizes[size]} ${className}`} />
  );
}

export interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ text = 'Loading...', size = 'md' }: Readonly<LoadingProps>) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Spinner size={size} />
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  );
}
