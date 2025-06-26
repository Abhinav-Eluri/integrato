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
      const apiResponse = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      
      // Check if response has expected structure
      if (!apiResponse) {
        throw new Error('No response received');
      }
      
      const response = apiResponse;
      
      // Store tokens
      if (response && response.access && response.refresh) {
        TokenManager.setTokens({
          access: response.access,
          refresh: response.refresh,
        });
      }
      
      // Store user data
      if (response && response.user) {
        this.setStoredUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const apiResponse = await apiClient.post<AuthResponse>('/auth/register/', data);
       
       const response = apiResponse;
    
    // Store tokens
    if (response.access && response.refresh) {
      TokenManager.setTokens({
        access: response.access,
        refresh: response.refresh,
      });
    }
    
    // Store user data
    if (response.user) {
      this.setStoredUser(response.user);
    }
    
    return response;
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
    const apiResponse = await apiClient.get<User>('/auth/user/');
       return apiResponse;
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const apiResponse = await apiClient.post<{ access: string; refresh?: string }>('/auth/token/refresh/', {
         refresh: refreshToken,
       });
       
       const response = apiResponse;

    const tokens = {
      access: response.access,
      refresh: response.refresh || refreshToken, // Use new refresh token if provided
    };

    TokenManager.setTokens(tokens);
    return tokens;
  }

  // Password management
  static async changePassword(data: ChangePasswordFormData): Promise<{ message: string }> {
    const apiResponse = await apiClient.post<{ message: string }>('/auth/change-password/', {
      old_password: data.old_password,
      new_password: data.new_password1,
      confirm_password: data.new_password2,
    });
    return apiResponse;
  }

  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    const apiResponse = await apiClient.post<{ message: string }>('/auth/password-reset/', {
      email,
    });
    return apiResponse;
  }

  static async confirmPasswordReset(
    uidb64: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    const apiResponse = await apiClient.post<{ message: string }>(
      `/auth/password-reset-confirm/${uidb64}/${token}/`,
      { 
        new_password: newPassword,
        confirm_password: confirmPassword
      }
    );
    return apiResponse;
  }

  // Social authentication
  static async googleLogin(accessToken: string): Promise<AuthResponse> {
    try {
   const apiResponse = await apiClient.post<AuthResponse>('/auth/google-oauth/', {
        access_token: accessToken,
      });
      
      const response = apiResponse;
      
      // Validate response structure
      if (!response) {
        throw new Error('No data received from server');
      }
      
      if (!response.access || !response.refresh) {
        throw new Error('Invalid response: missing access or refresh token');
      }
      
      // Store tokens
      TokenManager.setTokens({
        access: response.access,
        refresh: response.refresh,
      });
      
      // Store user data
      if (response.user) {
        this.setStoredUser(response.user);
      }
      
      return response;
    } catch (error: any) {
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