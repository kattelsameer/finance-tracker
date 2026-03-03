import { useEffect, useState } from 'react';
import { budgetService } from '../services/budget.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../contexts/AuthContext';
import type { Budget, Category, CreateBudgetRequest, UpdateBudgetRequest, PeriodType } from '../types';
import { BudgetList } from '../components/budgets/BudgetList';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SecondaryCurrencyBadge } from '../components/ui/SecondaryCurrencyBadge';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';
import { exchangeRateService } from '../services/exchange-rate.service';
import {
  Target,
  Plus,
  AlertCircle,
  X,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const PERIOD_LABELS: Record<PeriodType, string> = {
  'WEEKLY': 'Weekly',
  'MONTHLY': 'Monthly',
  'QUARTERLY': 'Quarterly',
  'YEARLY': 'Yearly'
};

export function BudgetsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'over'>('all');
  const [budgetInputCurrency, setBudgetInputCurrency] = useState(defaultCurrency);

  const [formData, setFormData] = useState<CreateBudgetRequest>({
    categoryId: undefined,
    budgetName: '',
    amount: 0,
    periodType: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    alertThreshold: 80,
    alertEnabled: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll()
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.filter(c => c.categoryType === 'EXPENSE'));
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      setSaving(true);

      // Convert budget amount to primary currency if a foreign currency was used
      let submitData = { ...formData };
      if (!editingBudget && budgetInputCurrency !== defaultCurrency && formData.amount > 0) {
        try {
          const { convertedAmount } = await exchangeRateService.convert(
            formData.amount, budgetInputCurrency, defaultCurrency
          );
          submitData = { ...submitData, amount: Math.round(convertedAmount * 100) / 100 };
        } catch {
          // fallback: save original amount if conversion fails
        }
      }

      if (editingBudget) {
        const updateData: UpdateBudgetRequest = {
          categoryId: submitData.categoryId,
          budgetName: submitData.budgetName,
          amount: submitData.amount,
          periodType: submitData.periodType,
          startDate: submitData.startDate,
          alertThreshold: submitData.alertThreshold,
          alertEnabled: submitData.alertEnabled
        };
        await budgetService.update(editingBudget.id, updateData);
      } else {
        await budgetService.create(submitData);
      }
      setShowModal(false);
      setEditingBudget(null);
      setModalError(null);
      resetForm();
      fetchData();
    } catch (err) {
      const apiErr = err as Error & { fieldErrors?: Array<{ field: string; message: string }> };
      const fieldErrors = apiErr.fieldErrors;
      if (fieldErrors && fieldErrors.length > 0) {
        const fieldLabels: Record<string, string> = {
          budgetName: 'Budget Name', categoryId: 'Category', amount: 'Budget Amount',
          periodType: 'Period', startDate: 'Start Date', alertThreshold: 'Alert Threshold',
        };
        setModalError(fieldErrors.map(fe => `${fieldLabels[fe.field] ?? fe.field}: ${fe.message}`).join(' • '));
      } else {
        setModalError(apiErr.message || 'Failed to save budget. Please check your inputs.');
      }
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id === null) return;
    try {
      await budgetService.delete(deleteConfirm.id);
      fetchData();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete budget');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setModalError(null);
    resetForm();
    setBudgetInputCurrency(defaultCurrency);
    setShowModal(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setModalError(null);
    setFormData({
      categoryId: budget.category?.id,
      budgetName: budget.budgetName,
      amount: budget.amount,
      periodType: budget.periodType,
      startDate: budget.startDate.split('T')[0],
      alertThreshold: budget.alertThreshold,
      alertEnabled: budget.alertEnabled
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      categoryId: undefined,
      budgetName: '',
      amount: 0,
      periodType: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
      alertEnabled: true
    });
  };

  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, defaultCurrency);

  const getPeriodLabel = (period: string): string => {
    return PERIOD_LABELS[period as PeriodType] || period;
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.budgetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'active') return matchesSearch && budget.isActive;
    if (filterStatus === 'over') return matchesSearch && budget.isOverBudget;
    return matchesSearch;
  });

  const totalBudgeted = budgets.filter(b => b.isActive).reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.filter(b => b.isActive).reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.isOverBudget && b.isActive).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading budgets...</p>
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
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Budgeted</span>
            </div>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudgeted)}</p>
              <SecondaryCurrencyBadge amount={totalBudgeted} className="flex-shrink-0" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Spent</span>
            </div>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              <SecondaryCurrencyBadge amount={totalSpent} className="flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {totalBudgeted > 0 ? `${Math.round((totalSpent / totalBudgeted) * 100)}% of budget` : 'No budget set'}
            </p>
          </div>
          <div className={`rounded-2xl p-6 shadow-lg ${overBudgetCount > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                {overBudgetCount > 0 ? <AlertTriangle className="h-5 w-5 text-white" /> : <CheckCircle2 className="h-5 w-5 text-white" />}
              </div>
              <span className="text-sm font-medium text-white/80">Budget Status</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {overBudgetCount > 0 ? `${overBudgetCount} Over Budget` : 'All On Track'}
            </p>
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
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              {(['all', 'active', 'over'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${filterStatus === status ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Over Budget'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            Create Budget
          </button>
        </div>

        {/* Budgets List - Using BudgetList Component */}
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-5">
              <Target className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No budgets found' : 'No budgets yet'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Create your first budget to start tracking spending'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Budget
              </button>
            )}
          </div>
        ) : (
          <BudgetList
            budgets={filteredBudgets}
            formatCurrency={formatCurrency}
            getPeriodLabel={getPeriodLabel}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Create/Edit Modal - Using BudgetForm Component */}
      {showModal && (
        <BudgetForm
          formData={formData}
          categories={categories}
          isEditing={!!editingBudget}
          saving={saving}
          serverError={modalError}
          inputCurrency={budgetInputCurrency}
          onInputCurrencyChange={setBudgetInputCurrency}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onClose={() => { setShowModal(false); setModalError(null); setBudgetInputCurrency(defaultCurrency); }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
