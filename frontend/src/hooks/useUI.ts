import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} from '@/store/slices/uiSlice';
import { Notification } from '@/types';

export const useUI = () => {
  const dispatch = useAppDispatch();
  const { theme, notifications } = useAppSelector(
    (state) => state.ui
  );

  const changeTheme = useCallback(
    (newTheme: 'light' | 'dark') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  const switchTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);



  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const fullNotification: Notification = { ...notification, id };
      dispatch(addNotification(fullNotification));
      
      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          dispatch(removeNotification(id));
        }, duration);
      }
    },
    [dispatch]
  );

  const hideNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Convenience methods for different notification types
  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: 'success', title, message, duration });
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: 'error', title, message, duration });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: 'warning', title, message, duration });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: 'info', title, message, duration });
    },
    [showNotification]
  );

  return {
    // State
    theme,
    notifications,
    
    // Theme actions
    changeTheme,
    switchTheme,
    
    // Notification actions
    showNotification,
    hideNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};