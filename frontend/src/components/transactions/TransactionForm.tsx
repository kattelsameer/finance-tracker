import { X } from 'lucide-react';
import type { Account, Category, CreateTransactionRequest } from '../../types';

interface TransactionFormProps {
  formData: CreateTransactionRequest;
  accounts: Account[];
  categories: Category[];
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateTransactionRequest) => void;
  onClose: () => void;
}

export function TransactionForm({ 
  formData, 
  accounts, 
  categories, 
  isEditing, 
  onSubmit, 
  onChange, 
  onClose 
}: Readonly<TransactionFormProps>) {
  const filteredCategories = categories.filter(cat => 
    formData.transactionType === 'TRANSFER' ? false : cat.categoryType === formData.transactionType
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-label="Close modal"
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => {
                  let buttonClass = 'bg-gray-100 text-gray-600 border-2 border-transparent';
                  
                  if (formData.transactionType === type) {
                    if (type === 'INCOME') {
                      buttonClass = 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500';
                    } else if (type === 'EXPENSE') {
                      buttonClass = 'bg-red-100 text-red-700 border-2 border-red-500';
                    } else {
                      buttonClass = 'bg-blue-100 text-blue-700 border-2 border-blue-500';
                    }
                  }

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onChange({ ...formData, transactionType: type, categoryId: undefined })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${buttonClass}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-semibold text-gray-700 mb-2">
                Account
              </label>
              <select
                id="account"
                value={formData.accountId}
                onChange={(e) => onChange({ ...formData, accountId: Number(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                ))}
              </select>
            </div>

            {formData.transactionType === 'TRANSFER' && (
              <div>
                <label htmlFor="transfer-to" className="block text-sm font-semibold text-gray-700 mb-2">
                  Transfer To
                </label>
                <select
                  id="transfer-to"
                  value={formData.transferToAccountId || ''}
                  onChange={(e) => onChange({ ...formData, transferToAccountId: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.id !== formData.accountId).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => onChange({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="transaction-date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  id="transaction-date"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => onChange({ ...formData, transactionDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.transactionType !== 'TRANSFER' && (
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.categoryId || ''}
                  onChange={(e) => onChange({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Add'} Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
