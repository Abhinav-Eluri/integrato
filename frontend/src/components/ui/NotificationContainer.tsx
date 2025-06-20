import React from 'react';
import { useUI } from '@/hooks/useUI';
import { cn } from '@/utils/cn';
import { Notification } from '@/types';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useUI();

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className={cn(
            'p-4 rounded-lg border shadow-lg animate-fade-in',
            getBackgroundColor(notification.type)
          )}
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              )}
            </div>

            {/* Close button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hideNotification(notification.id)}
                className="p-1 h-auto hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;