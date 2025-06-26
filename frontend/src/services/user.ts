import { apiClient } from './api';
import { User, ProfileFormData } from '@/types';

export class UserService {
  // Profile management
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile/');
    return response;
  }

  static async updateProfile(data: ProfileFormData): Promise<User> {
    const response = await apiClient.patch<User>('/users/profile/', data);
    return response;
  }

  static async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.patch<User>('/users/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  static async deleteAvatar(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/users/delete_avatar/');
    return response;
  }

  // User management
  static async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}/`);
    return response;
  }

  static async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/users/?search=${encodeURIComponent(query)}`);
    return response;
  }

  // Account management
  static async deleteAccount(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/users/profile/');
    return response;
  }

  static async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/users/verify-email/', {
      token,
    });
    return response;
  }

  static async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/users/resend-verification/');
    return response;
  }
}

export default UserService;