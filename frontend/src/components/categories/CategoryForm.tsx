import { X, AlertCircle } from 'lucide-react';
import type { Category, CreateCategoryRequest } from '../../types';

interface CategoryFormProps {
  formData: CreateCategoryRequest;
  categories: Category[];
  isEditing: boolean;
  saving: boolean;
  serverError?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateCategoryRequest) => void;
  onClose: () => void;
}

const colorOptions = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937',
];

export function CategoryForm({ formData, categories, isEditing, saving, serverError, onSubmit, onChange, onClose }: CategoryFormProps) {
  const parentCategories = categories.filter(c => c.categoryType === formData.categoryType && !c.parentId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {serverError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{serverError}</span>
              </div>
            )}
            <div>
              <label htmlFor="category-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                value={formData.categoryName}
                onChange={(e) => onChange({ ...formData, categoryName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Groceries"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['EXPENSE', 'INCOME'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onChange({ ...formData, categoryType: type, parentId: undefined })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        formData.categoryType === type
                          ? type === 'EXPENSE'
                            ? 'bg-red-100 text-red-700 border-2 border-red-500'
                            : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="parent-category" className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Category (Optional)
              </label>
              <select
                id="parent-category"
                value={formData.parentId || ''}
                onChange={(e) => onChange({ ...formData, parentId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Top Level)</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
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
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Add'} Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
