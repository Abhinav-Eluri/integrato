import React from 'react';
import { EmailMessage } from '../../types/integrations';

interface EmailPreviewProps {
  email: EmailMessage;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ email }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
        );
      case 'outlook':
        return (
          <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">@</span>
          </div>
        );
    }
  };

  const renderEmailContent = () => {
    if (email.body_preview) {
      return (
        <div className="whitespace-pre-wrap text-gray-900">
          {email.body_preview}
        </div>
      );
    } else {
      return (
        <div className="text-gray-500 italic">
          No content available
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getProviderIcon('email')}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {email.subject || '(No Subject)'}
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">
                  From: <span className="font-medium">{email.sender}</span>
                </span>
                {email.recipients.length > 0 && (
                  <span className="text-sm text-gray-600">
                    To: <span className="font-medium">{email.recipients.join(', ')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex items-center space-x-2">
            {email.is_important && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Important
              </span>
            )}
            
            {!email.is_read && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Unread
              </span>
            )}
            
            {false && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments
              </span>
            )}
          </div>
        </div>
        
        {/* Metadata */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Received: {formatDate(email.received_at)}</span>
            <span className="capitalize">Email</span>
          </div>
          
          {email.provider_message_id && (
            <span className="font-mono text-xs">
              ID: {email.provider_message_id.substring(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Snippet */}
        {email.body_preview && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 italic">
              {email.body_preview}
            </p>
          </div>
        )}
        
        {/* Email Body */}
        <div className="email-content">
          {renderEmailContent()}
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Email Details</h4>
            <div className="space-y-1">
              <div>Provider: <span className="font-medium capitalize">Email</span></div>
              <div>Status: <span className="font-medium">{email.is_read ? 'Read' : 'Unread'}</span></div>
              {false && (
                <div>Attachments: <span className="font-medium">Yes</span></div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
            <div className="space-y-1">
              <div>Received: <span className="font-medium">{formatDate(email.received_at)}</span></div>
              <div>Synced: <span className="font-medium">{formatDate(email.created_at)}</span></div>
              {email.updated_at !== email.created_at && (
                <div>Updated: <span className="font-medium">{formatDate(email.updated_at)}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;