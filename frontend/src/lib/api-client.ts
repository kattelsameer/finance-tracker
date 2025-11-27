import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config/api';
import type { ErrorResponse } from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // Important for HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add CSRF token for state-changing requests
        if (
          config.method &&
          ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())
        ) {
          if (!this.csrfToken) {
            await this.fetchCsrfToken();
          }
          if (this.csrfToken && config.headers) {
            config.headers['X-XSRF-TOKEN'] = this.csrfToken;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Extract CSRF token from response if present
        const csrfHeader = response.headers['x-xsrf-token'];
        if (csrfHeader) {
          this.csrfToken = csrfHeader;
        }
        return response;
      },
      (error: AxiosError<ErrorResponse>) => {
        // Handle errors globally
        if (error.response) {
          const { status, data } = error.response;

          // Handle 401 Unauthorized
          if (status === 401) {
            // Clear auth state and redirect to login
            this.csrfToken = null;
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }

          // Handle 403 Forbidden (CSRF)
          if (status === 403) {
            this.csrfToken = null;
            // Retry with new CSRF token
            return this.fetchCsrfToken().then(() => {
              return this.client.request(error.config!);
            });
          }

          return Promise.reject(data);
        }

        // Network error
        return Promise.reject({
          code: 5001,
          error: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
          timestamp: new Date().toISOString(),
        } as ErrorResponse);
      }
    );
  }

  private async fetchCsrfToken(): Promise<void> {
    try {
      const response = await axios.get(`${API_URL}/auth/csrf-token`, {
        withCredentials: true,
      });
      this.csrfToken = response.data.token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  public async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public resetCsrfToken() {
    this.csrfToken = null;
  }
}

export const apiClient = new ApiClient();
