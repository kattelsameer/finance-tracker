import React, { useState, useEffect } from 'react';
import { searchService } from '../services/search.service';
import { accountService } from '../services/account.service';
import { categoryService } from '../services/category.service';
import { tagService } from '../services/tag.service';
import {
  TransactionSearchRequest,
  Transaction,
  Account,
  Category,
  Tag,
  SavedSearch,
  TransactionType,
} from '../types/api';

const AdvancedSearchPage: React.FC = () => {
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [accountsData, categoriesData, tagsData, savedSearchesData] = await Promise.all([
        accountService.getAllAccounts(),
        categoryService.getAllCategories(),
        tagService.getAllTags(),
        searchService.getAllSavedSearches(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTags(tagsData);
      setSavedSearches(savedSearchesData);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.advancedSearch(searchCriteria);
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Search failed:', error);
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
      console.error('Failed to save search:', error);
    }
  };

  const handleLoadSavedSearch = async (savedSearch: SavedSearch) => {
    try {
      const criteria = JSON.parse(savedSearch.searchCriteria) as TransactionSearchRequest;
      setSearchCriteria(criteria);
      await handleSearch();
    } catch (error) {
      console.error('Failed to load saved search:', error);
    }
  };

  const handleDeleteSavedSearch = async (id: number) => {
    try {
      await searchService.deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete saved search:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchCriteria({ ...searchCriteria, page: newPage });
  };

  useEffect(() => {
    if (transactions.length > 0 || searchCriteria.page === 0) {
      handleSearch();
    }
  }, [searchCriteria.page]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Advanced Search</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(savedSearch => (
              <div
                key={savedSearch.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg"
              >
                <button
                  onClick={() => handleLoadSavedSearch(savedSearch)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {savedSearch.searchName}
                  {savedSearch.isDefault && ' ⭐'}
                </button>
                <button
                  onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Filters */}
      {showFilters && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Term
              </label>
              <input
                type="text"
                value={searchCriteria.searchTerm || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, searchTerm: e.target.value })}
                placeholder="Search description or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={searchCriteria.startDate || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={searchCriteria.endDate || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account
              </label>
              <select
                value={searchCriteria.accountId || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, accountId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={searchCriteria.categoryId || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={searchCriteria.transactionType || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, transactionType: e.target.value as TransactionType || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Amount
              </label>
              <input
                type="number"
                value={searchCriteria.minAmount || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount
              </label>
              <input
                type="number"
                value={searchCriteria.maxAmount || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={searchCriteria.currency || ''}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, currency: e.target.value })}
                placeholder="USD"
                maxLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Recurring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring
              </label>
              <select
                value={searchCriteria.isRecurring === undefined ? '' : searchCriteria.isRecurring.toString()}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, isRecurring: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Recurring Only</option>
                <option value="false">Non-Recurring</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={() => setShowSaveSearch(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Search
            </button>
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Save Search</h3>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Search name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Set as default search</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleSaveSearch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveSearch(false);
                  setSaveSearchName('');
                  setSaveAsDefault(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Results ({totalElements} transactions found)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                      {transaction.isRecurring && (
                        <span className="ml-2 text-xs text-blue-600">↻</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.accountName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.categoryName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.transactionType === 'INCOME'
                          ? 'bg-green-100 text-green-800'
                          : transaction.transactionType === 'EXPENSE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      transaction.transactionType === 'INCOME'
                        ? 'text-green-600'
                        : transaction.transactionType === 'EXPENSE'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
              <button
                onClick={() => handlePageChange(searchCriteria.page! - 1)}
                disabled={searchCriteria.page === 0}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {(searchCriteria.page || 0) + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(searchCriteria.page! + 1)}
                disabled={searchCriteria.page! >= totalPages - 1}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No transactions found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchPage;
