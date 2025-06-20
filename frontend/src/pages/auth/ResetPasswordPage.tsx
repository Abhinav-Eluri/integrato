import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUI } from '@/hooks/useUI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AuthService } from '@/services/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { showError, showSuccess } = useUI();

  // Validate that we have the required URL parameters
  useEffect(() => {
    if (!uidb64 || !token) {
      showError('Invalid Link', 'This password reset link is invalid or malformed.');
      navigate('/forgot-password');
    }
  }, [uidb64, token, navigate, showError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordFormData> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !uidb64 || !token) {
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.confirmPasswordReset(
        uidb64,
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      showSuccess('Password Reset Successful', response.message);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error ||
                          'An error occurred while resetting your password';
      
      if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
        showError('Invalid or Expired Link', 'This password reset link is invalid or has expired. Please request a new one.');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } else {
        showError('Reset Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
          
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Go to login now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your new password"
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

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>At least 8 characters long</li>
              <li>Must match the confirmation password</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;