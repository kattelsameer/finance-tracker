import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import { apiClient } from '../../lib/api-client';

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    resetCsrfToken: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call the login endpoint with credentials', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
      };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const credentials = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const credentials = {
        username: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should call the register endpoint with user data', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, email: 'newuser@example.com' },
      };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        displayName: 'New User',
      };

      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('auth/register', userData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call the logout endpoint and reset CSRF token', async () => {
      const mockResponse = { message: 'Logged out successfully' };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('auth/logout');
      expect(apiClient.resetCsrfToken).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should call the me endpoint', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      };
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('should call the change password endpoint', async () => {
      const mockResponse = { message: 'Password changed successfully' };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      const result = await authService.changePassword(passwordData);

      expect(apiClient.post).toHaveBeenCalledWith('auth/change-password', passwordData);
      expect(result).toEqual(mockResponse);
    });
  });
});
