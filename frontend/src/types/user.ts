export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  defaultCurrency: string;
  secondaryCurrency?: string | null;
  timezone?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  email?: string;
  displayName?: string;
  defaultCurrency?: string;
  secondaryCurrency?: string | null;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}
