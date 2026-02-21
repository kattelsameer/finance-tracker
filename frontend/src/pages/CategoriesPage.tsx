import { useEffect, useState } from 'react';
import { categoryService } from '../services/category.service';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { CategoryTree } from '../components/categories/CategoryTree';
import { CategoryForm } from '../components/categories/CategoryForm';
import { 
  FolderTree, 
  Plus, 
  AlertCircle,
  X
} from 'lucide-react';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    categoryName: '',
    categoryType: 'EXPENSE',
    colorCode: '#3B82F6',
    icon: 'folder',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingCategory) {
        const updateData: UpdateCategoryRequest = {
          categoryName: formData.categoryName,
          colorCode: formData.colorCode,
          icon: formData.icon,
          parentId: formData.parentId,
        };
        await categoryService.update(editingCategory.id, updateData);
      } else {
        await categoryService.create(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openCreateModal = (parentId?: number) => {
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      categoryType: activeTab,
      colorCode: '#3B82F6',
      icon: 'folder',
      parentId,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      categoryType: category.categoryType,
      colorCode: category.colorCode,
      icon: category.icon,
      parentId: category.parentId,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      categoryName: '',
      categoryType: 'EXPENSE',
      colorCode: '#3B82F6',
      icon: 'folder',
    });
  };

  const filteredCategories = categories.filter(
    cat => cat.categoryType === activeTab && !cat.parentId
  );

  const getChildCategories = (parentId: number) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 pt-6 pb-12">
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

        {/* Tabs & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('EXPENSE')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'EXPENSE'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setActiveTab('INCOME')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'INCOME'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Income
            </button>
          </div>
          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-5">
                <FolderTree className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">No categories yet</p>
              <p className="text-sm text-gray-400 mb-6">Create your first {activeTab.toLowerCase()} category</p>
              <button
                onClick={() => openCreateModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Category
              </button>
            </div>
          ) : (
            <CategoryTree
              categories={filteredCategories}
              expandedCategories={expandedCategories}
              onToggleExpand={toggleExpand}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onAddSubcategory={openCreateModal}
              getChildCategories={getChildCategories}
            />
          )}
        </div>
      </div>

      {/* Create/Edit Modal - Using CategoryForm Component */}
      {showModal && (
        <CategoryForm
          formData={formData}
          categories={categories}
          isEditing={!!editingCategory}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
