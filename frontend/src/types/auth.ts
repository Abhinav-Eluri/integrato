// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  bio: string;
  location: string;
  birth_date?: string;
  is_email_verified: boolean;
  date_joined: string;
  last_login?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PasswordChangeData {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  birth_date?: string;
}