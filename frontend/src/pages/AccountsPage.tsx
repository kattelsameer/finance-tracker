import { useEffect, useState } from 'react';
import { accountService } from '../services/account.service';
import { useAuth } from '../contexts/AuthContext';
import type { Account, AccountType, CreateAccountRequest, UpdateAccountRequest } from '../types/api';
import {
  Wallet,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  Search,
  CreditCard,
  Landmark,
  PiggyBank,
  Banknote,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';

const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const ACCOUNT_ICONS: { [key: string]: any } = {
  'wallet': Wallet,
  'credit-card': CreditCard,
  'landmark': Landmark,
  'piggy-bank': PiggyBank,
  'banknote': Banknote
};

export function AccountsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<CreateAccountRequest>({
    accountTypeId: 1,
    accountName: '',
    currency: defaultCurrency,
    initialBalance: 0,
    institutionName: '',
    accountNumberMasked: '',
    colorCode: ACCOUNT_COLORS[0],
    icon: 'wallet',
    includeInNetWorth: true,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [accountsData, typesData] = await Promise.all([
        accountService.getAll(),
        accountService.getAccountTypes()
      ]);
      setAccounts(accountsData);
      setAccountTypes(typesData);
      if (typesData.length > 0) {
        setFormData(prev => ({ ...prev, accountTypeId: typesData[0].id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAccount) {
        const updateData: UpdateAccountRequest = {
          accountTypeId: formData.accountTypeId,
          accountName: formData.accountName,
          currency: formData.currency,
          institutionName: formData.institutionName,
          accountNumberMasked: formData.accountNumberMasked,
          colorCode: formData.colorCode,
          icon: formData.icon,
          includeInNetWorth: formData.includeInNetWorth,
          notes: formData.notes
        };
        await accountService.update(editingAccount.id, updateData);
      } else {
        await accountService.create(formData);
      }
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await accountService.delete(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountTypeId: account.accountType.id,
      accountName: account.accountName,
      currency: account.currency,
      initialBalance: account.initialBalance,
      institutionName: account.institutionName || '',
      accountNumberMasked: account.accountNumberMasked || '',
      colorCode: account.colorCode,
      icon: account.icon,
      includeInNetWorth: account.includeInNetWorth,
      notes: account.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      accountTypeId: accountTypes[0]?.id || 1,
      accountName: '',
      currency: defaultCurrency,
      initialBalance: 0,
      institutionName: '',
      accountNumberMasked: '',
      colorCode: ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)],
      icon: 'wallet',
      includeInNetWorth: true,
      notes: ''
    });
  };

  const formatCurrency = (amount: number, currency: string = defaultCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.institutionName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || account.isActive;
    return matchesSearch && matchesActive;
  });

  const totalBalance = filteredAccounts
    .filter(a => a.includeInNetWorth && a.isActive)
    .reduce((sum, a) => sum + (a.accountType.isLiability ? -a.currentBalance : a.currentBalance), 0);

  const totalAssets = filteredAccounts
    .filter(a => !a.accountType.isLiability && a.isActive)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiabilities = filteredAccounts
    .filter(a => a.accountType.isLiability && a.isActive)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const getAccountIcon = (iconName: string) => {
    const IconComponent = ACCOUNT_ICONS[iconName] || Wallet;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl mb-5 shadow-lg">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Accounts</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Manage all your financial accounts in one place
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Assets</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-xl">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Liabilities</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLiabilities)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-100">Net Worth</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`p-3 rounded-xl border transition-colors ${showInactive ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title={showInactive ? 'Hide inactive accounts' : 'Show inactive accounts'}
            >
              {showInactive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Account
          </button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-5">
                <Wallet className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No accounts found' : 'No accounts yet'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Add your first account to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Account
                </button>
              )}
            </div>
          ) : (
            filteredAccounts.map(account => {
              const IconComponent = getAccountIcon(account.icon);
              return (
                <div
                  key={account.id}
                  className={`bg-white rounded-2xl p-5 shadow-lg border transition-all hover:shadow-xl ${!account.isActive ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: account.colorCode + '20' }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: account.colorCode }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                        <p className="text-sm text-gray-500">{account.accountType.typeName}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setDeleteConfirm(deleteConfirm === account.id ? null : account.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {deleteConfirm === account.id && (
                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-40">
                          <button
                            onClick={() => { openEditModal(account); setDeleteConfirm(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Account
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {account.institutionName && (
                    <p className="text-sm text-gray-500 mb-3">{account.institutionName}</p>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Current Balance</span>
                      <span className={`text-lg font-bold ${account.accountType.isLiability ? 'text-red-600' : 'text-gray-900'}`}>
                        {account.accountType.isLiability ? '-' : ''}{formatCurrency(account.currentBalance, account.currency)}
                      </span>
                    </div>
                  </div>

                  {!account.isActive && (
                    <div className="mt-3 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 text-center">
                      Inactive
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAccount ? 'Edit Account' : 'Add Account'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name *</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                    placeholder="e.g., Main Checking"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type *</label>
                    <select
                      value={formData.accountTypeId}
                      onChange={(e) => setFormData({ ...formData, accountTypeId: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      {accountTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.typeName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NPR">NPR - Nepalese Rupee</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>

                {!editingAccount && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    placeholder="e.g., Chase Bank"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number (Last 4 digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.accountNumberMasked}
                    onChange={(e) => setFormData({ ...formData, accountNumberMasked: e.target.value })}
                    placeholder="****"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Icon</label>
                  <div className="flex gap-2">
                    {Object.entries(ACCOUNT_ICONS).map(([key, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: key })}
                        className={`p-3 rounded-xl transition-all ${formData.icon === key ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Icon className="h-6 w-6" style={{ color: formData.colorCode }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCOUNT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorCode: color })}
                        className={`w-10 h-10 rounded-xl transition-all ${formData.colorCode === color ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="includeInNetWorth"
                    checked={formData.includeInNetWorth}
                    onChange={(e) => setFormData({ ...formData, includeInNetWorth: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeInNetWorth" className="text-sm font-medium text-gray-700">
                    Include in net worth calculation
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any notes about this account..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.accountName.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
