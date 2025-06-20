import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

// Button component types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: ReactNode;
}

// Input component types
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showRequired?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  autoClose?: boolean;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';

  notifications: Notification[];
}

// Loading Spinner types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Protected Route types
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Form types
export interface ChangePasswordFormData {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  birth_date?: string;
}