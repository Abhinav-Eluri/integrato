import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { integrationsApi } from '@/services/integrationsApi';
import { useUI } from '@/hooks/useUI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useUI();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          showError('Integration Failed', `OAuth error: ${error}`);
          navigate('/integrations');
          return;
        }

        // Check for required parameters
        if (!code || !state) {
          showError('Integration Failed', 'Missing required OAuth parameters');
          navigate('/integrations');
          return;
        }

        // Parse state to get provider info
        // State format: "user_id:provider:timestamp"
        const stateParts = state.split(':');
        if (stateParts.length < 2) {
          showError('Integration Failed', 'Invalid state parameter');
          navigate('/integrations');
          return;
        }

        const provider = stateParts[1];

        // Send callback data to backend
        await integrationsApi.handleOAuthCallback({
          code,
          provider,
          state
        });

        showSuccess(
          'Integration Successful',
          `Successfully connected ${provider.replace('_', ' ').toUpperCase()}`
        );

        // Redirect to integrations page
        navigate('/integrations');
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        showError(
          'Integration Failed',
          error.response?.data?.message || 'Failed to complete integration'
        );
        navigate('/integrations');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isProcessing ? 'Completing Integration...' : 'Integration Complete'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isProcessing 
              ? 'Please wait while we complete your integration setup.'
              : 'Redirecting you back to integrations...'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;