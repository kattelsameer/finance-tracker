import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budget.service';
import type { CreateBudgetRequest, UpdateBudgetRequest } from '../types';

export function useBudgets(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['budgets', activeOnly],
    queryFn: () => activeOnly ? budgetService.getActive() : budgetService.getAll(),
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetService.getById(id),
    enabled: !!id,
  });
}

// Note: getSummary method needs to be added to budgetService
// export function useBudgetSummary() {
//   return useQuery({
//     queryKey: ['budgets', 'summary'],
//     queryFn: budgetService.getSummary,
//   });
// }

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBudgetRequest }) =>
      budgetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => budgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
