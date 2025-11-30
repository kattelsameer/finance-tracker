import { ChevronRight, ChevronDown, Edit3, Trash2, Plus } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryTreeProps {
  categories: Category[];
  expandedCategories: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (parentId: number) => void;
  getChildCategories: (parentId: number) => Category[];
}

export function CategoryTree({ 
  categories, 
  expandedCategories, 
  onToggleExpand, 
  onEdit, 
  onDelete,
  onAddSubcategory,
  getChildCategories 
}: CategoryTreeProps) {
  const renderCategory = (category: Category, level = 0) => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          style={{ paddingLeft: `${level * 2 + 1}rem` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => onToggleExpand(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: category.colorCode }}
            />
            <span className="font-medium text-gray-900">{category.categoryName}</span>
            {category.isSystem && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">System</span>
            )}
          </div>
          {!category.isSystem && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddSubcategory(category.id)}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                title="Add subcategory"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(category)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {categories.map(category => renderCategory(category))}
    </div>
  );
}
