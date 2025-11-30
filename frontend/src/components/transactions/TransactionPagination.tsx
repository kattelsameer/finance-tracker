import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TransactionPagination({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize,
  onPageChange 
}: Readonly<TransactionPaginationProps>) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalElements} transactions
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="px-4 py-2 text-sm font-medium">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
