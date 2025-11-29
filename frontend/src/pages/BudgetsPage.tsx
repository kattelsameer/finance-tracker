import { useEffect, useState } from 'react';
import { budgetService } from '../services/budget.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../contexts/AuthContext';
import type { Budget, Category, CreateBudgetRequest, UpdateBudgetRequest, PeriodType } from '../types/api';
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  Search,
  Calendar,
  Bell,
  BellOff,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MoreVertical
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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'over'>('all');

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
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBudget) {
        const updateData: UpdateBudgetRequest = {
          categoryId: formData.categoryId,
          budgetName: formData.budgetName,
          amount: formData.amount,
          periodType: formData.periodType,
          startDate: formData.startDate,
          alertThreshold: formData.alertThreshold,
          alertEnabled: formData.alertEnabled
        };
        await budgetService.update(editingBudget.id, updateData);
      } else {
        await budgetService.create(formData);
      }
      setShowModal(false);
      setEditingBudget(null);
      resetForm();
      fetchData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await budgetService.delete(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency
    }).format(amount);
  };

  const getProgressColor = (percentUsed: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentUsed >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusIcon = (budget: Budget) => {
    if (budget.isOverBudget) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (budget.percentUsed >= 80) {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.budgetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mb-5 shadow-lg">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Budgets</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Set spending limits and track your progress toward financial goals
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Budgeted</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
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

        {/* Budgets List */}
        <div className="space-y-4">
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
            filteredBudgets.map(budget => (
              <div
                key={budget.id}
                className={`bg-white rounded-2xl p-6 shadow-lg border transition-all hover:shadow-xl ${!budget.isActive ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Budget Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(budget)}
                      <h3 className="font-bold text-gray-900 text-lg">{budget.budgetName}</h3>
                      {budget.alertEnabled && (
                        <Bell className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {budget.categoryName && (
                        <span className="px-2 py-1 bg-gray-100 rounded-lg">{budget.categoryName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {PERIOD_LABELS[budget.periodType]}
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="flex-1 lg:max-w-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {formatCurrency(budget.spent)} spent
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(budget.amount)} budget
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(budget.percentUsed, budget.isOverBudget)}`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className={`font-medium ${budget.isOverBudget ? 'text-red-600' : budget.percentUsed >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {budget.percentUsed.toFixed(0)}% used
                      </span>
                      <span className={`font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {budget.remaining < 0 ? `${formatCurrency(Math.abs(budget.remaining))} over` : `${formatCurrency(budget.remaining)} left`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setDeleteConfirm(deleteConfirm === budget.id ? null : budget.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {deleteConfirm === budget.id && (
                      <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-40">
                        <button
                          onClick={() => { openEditModal(budget); setDeleteConfirm(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Budget
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Budget
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBudget ? 'Edit Budget' : 'Create Budget'}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Name *</label>
                  <input
                    type="text"
                    value={formData.budgetName}
                    onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
                    required
                    placeholder="e.g., Monthly Groceries"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category (Optional)</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Period *</label>
                    <select
                      value={formData.periodType}
                      onChange={(e) => setFormData({ ...formData, periodType: e.target.value as PeriodType })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {formData.alertEnabled ? <Bell className="h-5 w-5 text-amber-500" /> : <BellOff className="h-5 w-5 text-gray-400" />}
                      <span className="font-medium text-gray-700">Budget Alerts</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, alertEnabled: !formData.alertEnabled })}
                      className={`w-12 h-7 rounded-full transition-colors ${formData.alertEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.alertEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {formData.alertEnabled && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Alert when spending reaches {formData.alertThreshold}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={formData.alertThreshold}
                        onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
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
                    disabled={saving || !formData.budgetName.trim() || formData.amount <= 0}
                    className="flex-1 px-4 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
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
