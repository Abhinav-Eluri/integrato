import { apiClient, TokenManager } from './api';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ChangePasswordFormData,
} from '@/types';

export class AuthService {
  // Authentication endpoints
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      console.log('Login response received:', response);
      
      // Check if response has expected structure
      if (!response) {
        throw new Error('No response received');
      }
      
      // Store tokens
      if (response.data.access && response.data.refresh) {
        TokenManager.setTokens({
          access: response.data.access,
          refresh: response.data.refresh,
        });
        console.log('Tokens stored successfully');
      } else {
        console.warn('Missing tokens in response:', {
          access: response.data.access,
          refresh: response.data.refresh
        });
      }
      
      // Store user data
      if (response.data.user) {
        this.setStoredUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService.login error:', error);
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register/', data);
    
    // Store tokens
    if (response.data.access && response.data.refresh) {
      TokenManager.setTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
    }
    
    // Store user data
    if (response.data.user) {
      this.setStoredUser(response.data.user);
    }
    
    return response.data;
  }

  static async logout(): Promise<void> {
    const tokens = TokenManager.getTokens();
    
    try {
      if (tokens?.access) {
        await apiClient.post('/auth/logout/', { access: tokens.access });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      this.clearStoredUser();
    }
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/user/');
    return response.data;
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    const tokens = {
      access: response.data.access,
      refresh: refreshToken,
    };

    TokenManager.setTokens(tokens);
    return tokens;
  }

  // Password management
  static async changePassword(data: ChangePasswordFormData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password/', {
      old_password: data.old_password,
      new_password: data.new_password1,
      confirm_password: data.new_password2,
    });
    return response.data;
  }

  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/', {
      email,
    });
    return response.data;
  }

  static async confirmPasswordReset(
    uidb64: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/auth/password-reset-confirm/${uidb64}/${token}/`,
      { 
        new_password: newPassword,
        confirm_password: confirmPassword
      }
    );
    return response.data;
  }

  // Social authentication
  static async googleLogin(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/google/', {
        access_token: accessToken,
      });
      
      // Store tokens
      if (response.data.access && response.data.refresh) {
        TokenManager.setTokens({
          access: response.data.access,
          refresh: response.data.refresh,
        });
      }
      
      // Store user data
      if (response.data.user) {
        this.setStoredUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService.googleLogin error:', error);
      throw error;
    }
  }

  // User data persistence
  static setStoredUser(user: User): void {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  static clearStoredUser(): void {
    localStorage.removeItem('user_data');
  }

  // Utility methods
  static isAuthenticated(): boolean {
    const tokens = TokenManager.getTokens();
    return !!tokens?.access;
  }

  static getStoredTokens(): AuthTokens | null {
    return TokenManager.getTokens();
  }

  static clearAuth(): void {
    TokenManager.clearTokens();
    this.clearStoredUser();
  }
}

export default AuthService;