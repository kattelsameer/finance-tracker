import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';
import type { CreateTransactionRequest, UpdateTransactionRequest, TransactionSearchRequest } from '../types';

export function useTransactions(params?: TransactionSearchRequest) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getAll(params),
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransactionRequest }) =>
      transactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => transactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
