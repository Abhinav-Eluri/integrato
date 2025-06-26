import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { integrationsApi } from '../services/api';
import { EmailMessage } from '../types/integrations';
import EmailList from '../components/email/EmailList';
import EmailFilters from '@/components/email/EmailFilters';
import EmailPreview from '@/components/email/EmailPreview';

const EmailPage: React.FC = () => {
  const { } = useAuth();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    provider: '',
    search: '',
    isRead: undefined as boolean | undefined,
    isImportant: undefined as boolean | undefined,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    hasPrevious: false,
    total: 0,
  });

  useEffect(() => {
    fetchEmails();
  }, [filters, pagination.page]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        page_size: 25,
      };

      if (filters.provider) params.provider = filters.provider;
      if (filters.search) params.search = filters.search;
      if (filters.isRead !== undefined) params.is_read = filters.isRead;
      if (filters.isImportant !== undefined) params.is_important = filters.isImportant;

      const response = await integrationsApi.getEmailMessages(params);
      
      setEmails(response.data.results);
      setPagination(prev => ({
        ...prev,
        hasNext: !!response.data.next,
        hasPrevious: !!response.data.previous,
        total: response.data.count,
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load email messages');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    setSelectedEmail(null); // Clear selection
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEmailSelect = async (email: EmailMessage) => {
    try {
      const response = await integrationsApi.getEmailMessage(email.id);
      setSelectedEmail(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load email details');
    }
  };

  if (loading && emails.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage emails from your connected accounts
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

        {/* Filters */}
        <EmailFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Content */}
        <div className="mt-8">
          {emails.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email List */}
              <div className="lg:col-span-1">
                <EmailList
                  emails={emails}
                  selectedEmail={selectedEmail}
                  onEmailSelect={handleEmailSelect}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
              
              {/* Email Preview */}
              <div className="lg:col-span-2">
                {selectedEmail ? (
                  <EmailPreview email={selectedEmail} />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center">
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        Select an email
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose an email from the list to view its contents.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No emails found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filters.search || filters.provider || filters.isRead !== undefined || filters.isImportant !== undefined
                  ? 'Try adjusting your filters or search terms.'
                  : 'Connect an email integration to see your messages here.'}
              </p>
              {!filters.search && !filters.provider && filters.isRead === undefined && filters.isImportant === undefined && (
                <div className="mt-6">
                  <a
                    href="/integrations"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    Connect Email
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailPage;