import React from 'react';
import { IntegrationStats as IIntegrationStats } from '../../types/integrations';

interface IntegrationStatsProps {
  stats: IIntegrationStats;
}

const IntegrationStats: React.FC<IntegrationStatsProps> = ({ stats }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google_calendar':
        return 'Google Calendar';
      case 'google_gmail':
        return 'Gmail';
      case 'microsoft_calendar':
        return 'Microsoft Calendar';
      case 'microsoft_outlook':
        return 'Microsoft Outlook';
      default:
        return provider;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Integration Overview</h2>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Integrations</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total_integrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Connected</p>
              <p className="text-2xl font-bold text-green-900">{stats.connected_integrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Calendar Events</p>
              <p className="text-2xl font-bold text-purple-900">{stats.total_events.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Email Messages</p>
              <p className="text-2xl font-bold text-orange-900">{stats.total_emails.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      {Object.keys(stats.providers).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.providers).map(([provider, data]) => (
              <div key={provider} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getProviderName(provider)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.connected} of {data.count} connected
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${data.count > 0 ? (data.connected / data.count) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {data.count > 0 ? Math.round((data.connected / data.count) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Sync Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Last Synchronization</p>
            <p className="text-sm text-gray-500">{formatDate(stats.last_sync)}</p>
          </div>
          <div className="flex items-center">
            {stats.last_sync ? (
              <div className="flex items-center text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Synced</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-400">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">No sync yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationStats;