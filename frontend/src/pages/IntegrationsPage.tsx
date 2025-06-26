import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { integrationsApi } from '../services/api';
import IntegrationCard from '../components/integrations/IntegrationCard';
import IntegrationStats from '@/components/integrations/IntegrationStats';
import AvailableProviders from '@/components/integrations/AvailableProviders';
import { Integration, IntegrationStats as IIntegrationStats, Provider } from '@/types/integrations';

const IntegrationsPage: React.FC = () => {
  const { } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IIntegrationStats | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'available'>('dashboard');

  useEffect(() => {
    fetchData();
    
    // Check for OAuth callback success/error messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (success === 'true' && message) {
      // Show success notification
      console.log(`Success: ${decodeURIComponent(message)}`);
      // You can replace this with a proper toast notification
      alert(`✅ ${decodeURIComponent(message)}`);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'true' && message) {
      // Show error notification
      console.log(`Error: ${decodeURIComponent(message)}`);
      // You can replace this with a proper toast notification
      alert(`❌ ${decodeURIComponent(message)}`);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [integrationsRes, statsRes, providersRes] = await Promise.all([
        integrationsApi.getIntegrations(),
        integrationsApi.getStats(),
        integrationsApi.getAvailableProviders()
      ]);
      
      setIntegrations(integrationsRes.data);
      setStats(statsRes.data);
      setProviders(providersRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      const response = await integrationsApi.initiateOAuth(provider);
      window.location.href = response.data.oauth_url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate connection');
    }
  };

  const handleDisconnect = async (integrationId: number) => {
    try {
      await integrationsApi.disconnectIntegration(integrationId);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect integration');
    }
  };

  const handleDelete = async (integrationId: number) => {
    try {
      const response = await integrationsApi.deleteIntegration(integrationId);
      console.log('Integration deleted:', response.data.deleted_data);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete integration');
    }
  };

  const handleSync = async (integrationId: number) => {
    try {
      await integrationsApi.manualSync(integrationId, 'full');
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync integration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect and manage your third-party accounts
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Available Integrations
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Stats */}
            {stats && <IntegrationStats stats={stats} />}

            {/* Connected Integrations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Connected Integrations
              </h2>
              {integrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onDisconnect={handleDisconnect}
                      onDelete={handleDelete}
                      onSync={handleSync}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No integrations connected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by connecting your first integration.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('available')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      Browse Integrations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AvailableProviders providers={providers} onConnect={handleConnect} />
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;