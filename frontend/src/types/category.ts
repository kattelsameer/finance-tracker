export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  categoryName: string;
  categoryType: CategoryType;
  parentId?: number;
  parentName?: string;
  colorCode: string;
  icon?: string;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  subcategories?: Category[];
  createdAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  categoryType: CategoryType;
  parentId?: number;
  colorCode: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  colorCode?: string;
  icon?: string;
  parentId?: number;
  displayOrder?: number;
}
