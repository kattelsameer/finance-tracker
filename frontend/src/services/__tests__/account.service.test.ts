import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountService } from '../account.service';
import { apiClient } from '../../lib/api-client';

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('accountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all accounts', async () => {
      const mockAccounts = [
        { id: 1, name: 'Checking', balance: 1000 },
        { id: 2, name: 'Savings', balance: 5000 },
      ];
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccounts);

      const result = await accountService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/accounts');
      expect(result).toEqual(mockAccounts);
    });

    it('should handle empty accounts list', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await accountService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch a single account by id', async () => {
      const mockAccount = { id: 1, name: 'Checking', balance: 1000 };
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccount);

      const result = await accountService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/1');
      expect(result).toEqual(mockAccount);
    });

    it('should throw error for non-existent account', async () => {
      const error = new Error('Account not found');
      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(accountService.getById(999)).rejects.toThrow('Account not found');
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const newAccount = { name: 'New Account', balance: 0, accountTypeId: 1 };
      const createdAccount = { id: 3, ...newAccount };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(createdAccount);

      const result = await accountService.create(newAccount);

      expect(apiClient.post).toHaveBeenCalledWith('/accounts', newAccount);
      expect(result).toEqual(createdAccount);
    });
  });

  describe('update', () => {
    it('should update an existing account', async () => {
      const updateData = { name: 'Updated Account' };
      const updatedAccount = { id: 1, name: 'Updated Account', balance: 1000 };
      (apiClient.put as ReturnType<typeof vi.fn>).mockResolvedValue(updatedAccount);

      const result = await accountService.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/accounts/1', updateData);
      expect(result).toEqual(updatedAccount);
    });
  });

  describe('delete', () => {
    it('should delete an account', async () => {
      (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ message: 'Deleted' });

      await accountService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/accounts/1');
    });
  });
});
