import React, { useState } from 'react';
import { Provider } from '../../types/integrations';

interface AvailableProvidersProps {
  providers: Provider[];
  onConnect: (provider: string) => void;
}

const AvailableProviders: React.FC<AvailableProvidersProps> = ({
  providers,
  onConnect,
}) => {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const getProviderIcon = (provider: Provider) => {
    switch (provider.id) {
      case 'google_calendar':
        return (
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
        );
      case 'google_gmail':
        return (
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
        );
      case 'microsoft_calendar':
        return (
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
        );
      case 'microsoft_outlook':
        return (
          <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'calendar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleConnect = async (provider: Provider) => {
    if (!provider.available) return;
    
    setConnectingProvider(provider.id);
    try {
      await onConnect(provider.id);
    } finally {
      setConnectingProvider(null);
    }
  };

  const availableProviders = providers.filter(p => p.available);
  const unavailableProviders = providers.filter(p => !p.available);

  return (
    <div className="space-y-8">
      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Available Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {getProviderIcon(provider)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {provider.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-500">
                      {getTypeIcon(provider.type)}
                      <span className="text-xs capitalize">{provider.type}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {provider.description}
                  </p>
                  <button
                    onClick={() => handleConnect(provider)}
                    disabled={connectingProvider === provider.id}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectingProvider === provider.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Connect
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      {unavailableProviders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unavailableProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60"
              >
                <div className="flex items-start space-x-4">
                  {getProviderIcon(provider)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {provider.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-gray-500">
                        {getTypeIcon(provider.type)}
                        <span className="text-xs capitalize">{provider.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {provider.description}
                    </p>
                    <div className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              How to connect integrations
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Click "Connect" on any available integration to start the OAuth flow. 
                You'll be redirected to the provider's website to authorize access, 
                then brought back to complete the setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableProviders;