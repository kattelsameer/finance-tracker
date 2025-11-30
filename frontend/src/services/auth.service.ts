import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthResponse,
  User,
} from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data);
  },

  async logout(): Promise<{ message: string }> {
    const result = await apiClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT);
    apiClient.resetCsrfToken();
    return result;
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(ENDPOINTS.AUTH.ME);
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>(ENDPOINTS.AUTH.ME, data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
};
