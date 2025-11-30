import { X } from 'lucide-react';
import type { AccountType, CreateAccountRequest } from '../../types';

interface AccountFormProps {
  formData: CreateAccountRequest;
  accountTypes: AccountType[];
  isEditing: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateAccountRequest) => void;
  onClose: () => void;
}

const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function AccountForm({ formData, accountTypes, isEditing, saving, onSubmit, onChange, onClose }: Readonly<AccountFormProps>) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Account' : 'Add Account'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="account-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Account Name
              </label>
              <input
                id="account-name"
                type="text"
                value={formData.accountName}
                onChange={(e) => onChange({ ...formData, accountName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Checking"
              />
            </div>

            <div>
              <label htmlFor="account-type" className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="account-type"
                value={formData.accountTypeId}
                onChange={(e) => onChange({ ...formData, accountTypeId: Number(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                {accountTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.typeName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency
                </label>
                <input
                  id="currency"
                  type="text"
                  value={formData.currency}
                  onChange={(e) => onChange({ ...formData, currency: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="initial-balance" className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Balance
                </label>
                <input
                  id="initial-balance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => onChange({ ...formData, initialBalance: Number.parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {ACCOUNT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange({ ...formData, colorCode: color })}
                    className={`w-8 h-8 rounded-lg border-2 ${formData.colorCode === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
