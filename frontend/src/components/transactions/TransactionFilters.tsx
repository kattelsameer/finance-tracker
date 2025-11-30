import type { Account, TransactionFilter } from '../../types';

interface TransactionFiltersProps {
  filter: TransactionFilter;
  accounts: Account[];
  onFilterChange: (filter: TransactionFilter) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({ 
  filter, 
  accounts, 
  onFilterChange, 
  onClearFilters 
}: Readonly<TransactionFiltersProps>) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="date-from" className="block text-sm font-semibold text-gray-700 mb-2">
            Date From
          </label>
          <input
            id="date-from"
            type="date"
            value={filter.startDate || ''}
            onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value, page: 0 })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="date-to" className="block text-sm font-semibold text-gray-700 mb-2">
            Date To
          </label>
          <input
            id="date-to"
            type="date"
            value={filter.endDate || ''}
            onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value, page: 0 })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="transaction-type" className="block text-sm font-semibold text-gray-700 mb-2">
            Type
          </label>
          <select
            id="transaction-type"
            value={filter.transactionType || ''}
            onChange={(e) => onFilterChange({ ...filter, transactionType: (e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSFER') || undefined, page: 0 })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <div>
          <label htmlFor="account-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            Account
          </label>
          <select
            id="account-filter"
            value={filter.accountId || ''}
            onChange={(e) => onFilterChange({ ...filter, accountId: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.accountName}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
