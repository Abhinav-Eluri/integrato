import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { RegisterData } from '@/types';
import { AuthService } from '@/services/auth';
import { setAuth } from '@/store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const { register, isAuthenticated, loading, error, clearAuthError } = useAuth();
  const { showError, showSuccess } = useUI();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // Show error notifications and handle field-specific errors
  useEffect(() => {
    if (error) {
      // Check if error contains field-specific validation errors
      if (error.includes(':')) {
        const fieldErrors: Partial<RegisterData> = {};
        const errorLines = error.split('\n');
        
        errorLines.forEach(line => {
          const [field, message] = line.split(': ', 2);
          if (field && message) {
            // Map backend field names to frontend field names
            const fieldMap: { [key: string]: keyof RegisterData } = {
              'username': 'username',
              'email': 'email',
              'password1': 'password1',
              'password2': 'password2',
              'first_name': 'first_name',
              'last_name': 'last_name'
            };
            
            const mappedField = fieldMap[field];
            if (mappedField) {
              fieldErrors[mappedField] = message;
            }
          }
        });
        
        // Set field-specific errors
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
        
        // Show general error notification
        showError('Registration Failed', 'Please check the form for errors.');
      } else {
        // Show the error as a general notification
        showError('Registration Failed', error);
      }
    }
  }, [error, showError]);

  // Google OAuth login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await AuthService.googleLogin(tokenResponse.access_token);
        // Update Redux store with user and tokens
        dispatch(setAuth({ user: response.user, tokens: { access: response.access, refresh: response.refresh } }));
        showSuccess('Registration Successful', 'Welcome! Your account has been created.');
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('Google login error:', error);
        showError('Google Registration Failed', error.response?.data?.detail || 'An error occurred during Google registration');
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      showError('Google Registration Failed', 'Failed to authenticate with Google');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password1) {
      newErrors.password1 = 'Password is required';
    } else if (formData.password1.length < 8) {
      newErrors.password1 = 'Password must be at least 8 characters';
    }

    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password1 !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(formData);
      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess(
          'Account Created!',
          'Your account has been created successfully. Welcome!'
        );
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth slice and useEffect above
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                placeholder="First name"
              />

              <Input
                label="Last name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                placeholder="Last name"
              />
            </div>

            <Input
              label="Username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choose a username"
              helperText="Must be at least 3 characters"
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
            />

            <div className="relative">
              <Input
                label="Password"
                name="password1"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password1}
                onChange={handleChange}
                error={errors.password1}
                placeholder="Create a password"
                helperText="Must be at least 8 characters"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm password"
                name="password2"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password2}
                onChange={handleChange}
                error={errors.password2}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="w-full max-w-xs"
                onClick={() => googleLogin()}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;