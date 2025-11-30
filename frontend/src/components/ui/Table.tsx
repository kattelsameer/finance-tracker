import { ReactNode } from 'react';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: Readonly<TableProps>) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: Readonly<TableHeaderProps>) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: Readonly<TableBodyProps>) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function TableRow({ children, className = '', onClick, hover = true }: Readonly<TableRowProps>) {
  return (
    <tr
      className={`
        ${hover ? 'hover:bg-gray-50' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: Readonly<TableHeadProps>) {
  return (
    <th
      className={`
        px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
        ${className}
      `}
    >
      {children}
    </th>
  );
}

export interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: Readonly<TableCellProps>) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}
