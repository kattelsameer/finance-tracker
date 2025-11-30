import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../services/account.service';
import type { CreateAccountRequest, UpdateAccountRequest } from '../types';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountRequest }) =>
      accountService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => accountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
