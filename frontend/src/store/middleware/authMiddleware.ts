import { clearAuth, getCurrentUser } from '../slices/authSlice';
import { AuthService } from '@/services/auth';

export const authMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    
    // Initialize auth state on app start
    if (action.type === '@@INIT' || action.type === 'auth/initializeAuth') {
      const tokens = AuthService.getStoredTokens();
      if (tokens) {
        // Verify token and get user data
        store.dispatch(getCurrentUser() as any);
      }
    }
    
    // Handle token expiration
    if (action.type === 'auth/getCurrentUser/rejected') {
      const error = action.payload as string;
      if (error.includes('401') || error.includes('token')) {
        store.dispatch(clearAuth());
      }
    }
    
    return result;
  };