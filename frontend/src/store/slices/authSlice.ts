import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '@/services/auth';
import { UserService } from '@/services/user';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthState,
  ChangePasswordFormData,
} from '@/types';

// Initial state
const initialState: AuthState = {
  user: AuthService.getStoredUser(),
  tokens: AuthService.getStoredTokens(),
  isAuthenticated: AuthService.isAuthenticated(),
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      console.log('Login response:', response);
      console.log('Response structure:', {
        user: response.user,
        access: response.access,
        refresh: response.refresh,
        message: response.message
      });
      return response;
    } catch (error: any) {
      console.log('Login error:', error);
      // Handle backend error format
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for non_field_errors first (common for login failures)
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          return rejectWithValue(errorData.non_field_errors[0]);
        }
        
        // Fallback to message if available
        if (errorData.message) {
          return rejectWithValue(errorData.message);
        }
      }
      
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(data);
      return response;
    } catch (error: any) {
      // Handle detailed validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // If there are field-specific errors, format them for display
        if (typeof errorData === 'object' && !errorData.message) {
          const errorMessages: string[] = [];
          
          Object.keys(errorData).forEach(field => {
            const fieldErrors = errorData[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(err => {
                errorMessages.push(`${field}: ${err}`);
              });
            } else if (typeof fieldErrors === 'string') {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          });
          
          return rejectWithValue(errorMessages.join('\n'));
        }
        
        // If there's a general message, use it
        if (errorData.message) {
          return rejectWithValue(errorData.message);
        }
        
        // If there are non_field_errors, use them
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          return rejectWithValue(errorData.non_field_errors.join('\n'));
        }
      }
      
      return rejectWithValue('Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user data'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: any, { rejectWithValue }) => {
    try {
      const user = await UserService.updateProfile(data);
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordFormData, { rejectWithValue }) => {
    try {
      const response = await AuthService.changePassword(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await AuthService.refreshToken();
      return tokens;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Token refresh failed'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
    setAuth: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      AuthService.clearAuth();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Store updated user data
        AuthService.setStoredUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = {
          access: action.payload.access,
          refresh: action.payload.refresh,
        };
        state.isAuthenticated = true;
        state.error = null;
        // User data is already stored in AuthService.login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = {
          access: action.payload.access,
          refresh: action.payload.refresh,
        };
        state.isAuthenticated = true;
        state.error = null;
        // User data is already stored in AuthService.register
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Still clear auth on logout error
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        // Store updated user data
        AuthService.setStoredUser(action.payload);
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        // Don't set error for getCurrentUser failures as they're usually due to invalid tokens
        // and shouldn't show error notifications
        state.error = null;
        // If getting user fails, clear auth
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        // Store updated user data
        AuthService.setStoredUser(action.payload);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setTokens, setAuth, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;