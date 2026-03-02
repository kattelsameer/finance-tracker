import React, { useState, useEffect } from 'react';
import { searchService } from '../services/search.service';
import { accountService } from '../services/account.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import {
  TransactionSearchRequest,
  Transaction,
  Account,
  Category,
  SavedSearch,
  TransactionType,
} from '../types';
import {
  Search,
  Filter,
  Star,
  Save,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Wallet,
  FolderTree,
  DollarSign,
  Repeat,
  X,
  Sparkles,
  FileSearch
} from 'lucide-react';

const AdvancedSearchPage: React.FC = () => {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  // Search criteria state
  const [searchCriteria, setSearchCriteria] = useState<TransactionSearchRequest>({
    page: 0,
    size: 20,
    sortBy: 'transactionDate',
    sortDirection: 'DESC',
  });

  // Results state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter options state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [accountsData, categoriesData, savedSearchesData] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
        searchService.getAllSavedSearches(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setSavedSearches(savedSearchesData);
    } catch (error) {
      logger.error('Failed to load filter options:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchService.advancedSearch(searchCriteria);
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      logger.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchCriteria({
      page: 0,
      size: 20,
      sortBy: 'transactionDate',
      sortDirection: 'DESC',
    });
    setTransactions([]);
    setHasSearched(false);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) return;
    
    try {
      const newSearch = await searchService.createSavedSearch({
        searchName: saveSearchName,
        searchCriteria: JSON.stringify(searchCriteria),
        isDefault: saveAsDefault,
      });
      setSavedSearches([newSearch, ...savedSearches]);
      setShowSaveSearch(false);
      setSaveSearchName('');
      setSaveAsDefault(false);
    } catch (error) {
      logger.error('Failed to save search:', error);
    }
  };

  const handleLoadSavedSearch = async (savedSearch: SavedSearch) => {
    try {
      const criteria = JSON.parse(savedSearch.searchCriteria) as TransactionSearchRequest;
      setSearchCriteria(criteria);
      // Don't auto-search, let user review criteria first
    } catch (error) {
      logger.error('Failed to load saved search:', error);
    }
  };

  const handleDeleteSavedSearch = async (id: number) => {
    try {
      await searchService.deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter(s => s.id !== id));
    } catch (error) {
      logger.error('Failed to delete saved search:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchCriteria({ ...searchCriteria, page: newPage });
  };

  // Search when page changes
  useEffect(() => {
    if (searchCriteria.page > 0) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCriteria.page]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || defaultCurrency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeConfig = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: TrendingUp };
      case 'EXPENSE':
        return { bg: 'bg-rose-100', text: 'text-rose-700', icon: TrendingDown };
      case 'TRANSFER':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: ArrowRightLeft };
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
          <p className="text-sm text-gray-500 mt-1">Find transactions with powerful filters</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 ${
            showFilters 
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700">Saved Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(savedSearch => (
              <div
                key={savedSearch.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => handleLoadSavedSearch(savedSearch)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {savedSearch.searchName}
                  {savedSearch.isDefault && <Star className="h-3 w-3 inline ml-1 text-amber-500 fill-amber-500" />}
                </button>
                <button
                  onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search Term */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Search className="h-4 w-4 text-gray-400" />
                Search Term
              </label>
              <input
                type="text"
                value={searchCriteria.searchTerm || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, searchTerm: e.target.value })}
                placeholder="Search description or notes..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Start Date
              </label>
              <input
                type="date"
                value={searchCriteria.startDate || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                End Date
              </label>
              <input
                type="date"
                value={searchCriteria.endDate || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Account */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Wallet className="h-4 w-4 text-gray-400" />
                Account
              </label>
              <select
                value={searchCriteria.accountId || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, accountId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FolderTree className="h-4 w-4 text-gray-400" />
                Category
              </label>
              <select
                value={searchCriteria.categoryId || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                Type
              </label>
              <select
                value={searchCriteria.transactionType || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, transactionType: e.target.value as TransactionType || undefined })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                Min Amount
              </label>
              <input
                type="number"
                value={searchCriteria.minAmount || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                Max Amount
              </label>
              <input
                type="number"
                value={searchCriteria.maxAmount || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Recurring */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Repeat className="h-4 w-4 text-gray-400" />
                Recurring
              </label>
              <select
                value={searchCriteria.isRecurring === undefined ? '' : searchCriteria.isRecurring.toString()}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, isRecurring: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">Recurring Only</option>
                <option value="false">Non-Recurring</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={() => setShowSaveSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Search
            </button>
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Save className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Save Search</h3>
            </div>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Give your search a name..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 mb-4"
            />
            <label className="flex items-center gap-3 mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-amber-800">Set as default search</span>
                <p className="text-xs text-amber-600">This search will load automatically</p>
              </div>
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleSaveSearch}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveSearch(false);
                  setSaveSearchName('');
                  setSaveAsDefault(false);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSearch className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800">
                Results <span className="text-slate-500 font-normal">({totalElements} transactions)</span>
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction, idx) => {
                  const typeConfig = getTypeConfig(transaction.transactionType);
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <tr key={transaction.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          {transaction.description}
                          {transaction.isRecurring && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              <Repeat className="h-3 w-3 inline" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaction.accountName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaction.categoryName || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                          <TypeIcon className="h-3 w-3" />
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm text-right font-semibold ${
                        transaction.transactionType === 'INCOME'
                          ? 'text-emerald-600'
                          : transaction.transactionType === 'EXPENSE'
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handlePageChange((searchCriteria.page || 0) - 1)}
                disabled={searchCriteria.page === 0}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-800">{(searchCriteria.page || 0) + 1}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange((searchCriteria.page || 0) + 1)}
                disabled={(searchCriteria.page || 0) >= totalPages - 1}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {!hasSearched ? 'Advanced Search' : 'No transactions found'}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {!hasSearched 
              ? 'Use the filters above and click Search to find specific transactions.' 
              : "Try adjusting your search criteria or filters to find what you're looking for."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchPage;
