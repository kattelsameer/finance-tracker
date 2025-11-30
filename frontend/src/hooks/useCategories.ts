import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { CategoryType, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: type ? ['categories', type] : ['categories'],
    queryFn: () => (type ? categoryService.getByType(type) : categoryService.getAll()),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
