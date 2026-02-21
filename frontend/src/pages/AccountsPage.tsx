import { useEffect, useState } from 'react';
import { accountService } from '../services/account.service';
import { useAuth } from '../contexts/AuthContext';
import type { Account, AccountType, CreateAccountRequest, UpdateAccountRequest } from '../types';
import { AccountList } from '../components/accounts/AccountList';
import { AccountForm } from '../components/accounts/AccountForm';
import {
  Wallet,
  Plus,
  AlertCircle,
  X,
  Search,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch accounts');
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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountService.delete(id);
      fetchData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete account');
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
    return matchesSearch;
  });

  const displayAccounts = showInactive ? filteredAccounts : filteredAccounts.filter(a => a.isActive);

  // Calculate totals - liabilities may already be stored as negative values
  const totalAssets = accounts
    .filter(a => !a.accountType.isLiability && a.isActive)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiabilities = accounts
    .filter(a => a.accountType.isLiability && a.isActive)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  // Net Worth = Assets - Liabilities (using absolute value of liabilities)
  const totalBalance = accounts
    .filter(a => a.includeInNetWorth && a.isActive)
    .reduce((sum, a) => {
      if (a.accountType.isLiability) {
        // Subtract the absolute value of liability balance
        return sum - Math.abs(a.currentBalance);
      }
      return sum + a.currentBalance;
    }, 0);

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
            <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalLiabilities)}</p>
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

        {/* Accounts List - Using AccountList Component */}
        {displayAccounts.length === 0 ? (
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
          <AccountList
            accounts={displayAccounts}
            formatCurrency={formatCurrency}
            onEdit={openEditModal}
            onDelete={handleDelete}
            showInactive={showInactive}
          />
        )}
      </div>

      {/* Create/Edit Modal - Using AccountForm Component */}
      {showModal && (
        <AccountForm
          formData={formData}
          accountTypes={accountTypes}
          isEditing={!!editingAccount}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
