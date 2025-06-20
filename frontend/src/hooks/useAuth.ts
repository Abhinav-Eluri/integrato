import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  clearError,
} from '@/store/slices/authSlice';
import {
  LoginCredentials,
  RegisterData,
  ChangePasswordFormData,
} from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, tokens, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    (credentials: LoginCredentials) => {
      return dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    (data: RegisterData) => {
      return dispatch(registerUser(data));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  const refreshUser = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const updateProfile = useCallback(
    (data: any) => {
      return dispatch(updateUserProfile(data));
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    (data: ChangePasswordFormData) => {
      return dispatch(changePassword(data));
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    updatePassword,
    clearAuthError,
  };
};