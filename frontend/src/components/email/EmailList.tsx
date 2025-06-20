import React from 'react';
import { EmailMessage } from '../../types/integrations';

interface EmailListProps {
  emails: EmailMessage[];
  selectedEmail: EmailMessage | null;
  onEmailSelect: (email: EmailMessage) => void;
  loading: boolean;
  pagination: {
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  onEmailSelect,
  loading,
  pagination,
  onPageChange,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
        );
      case 'outlook':
        return (
          <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">@</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Emails ({pagination.total})
        </h3>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {loading && emails.length === 0 ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading emails...</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Provider Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getProviderIcon('email')}
                </div>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      email.is_read ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {truncateText(email.sender, 25)}
                    </p>
                    <div className="flex items-center space-x-1">
                      {email.is_important && (
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(email.received_at)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    email.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'
                  }`}>
                    {truncateText(email.subject, 40)}
                  </p>
                  
                  {email.body_preview && (
                    <p className="text-xs text-gray-500 mt-1">
                      {truncateText(email.body_preview, 60)}
                    </p>
                  )}
                  
                  {/* Status indicators */}
                  <div className="flex items-center mt-2 space-x-2">
                    {!email.is_read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Unread
                      </span>
                    )}
                    {false && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {emails.length > 0 && (pagination.hasNext || pagination.hasPrevious) && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious || loading}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {pagination.page}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailList;