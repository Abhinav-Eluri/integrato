import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { cn } from '@/utils/cn';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

const NotificationsPage: React.FC = () => {
  const { } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'error':
        return XCircleIcon;
      case 'info':
      default:
        return InformationCircleIcon;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your latest activities and updates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Mark all read</span>
                </Button>
              )}
              <Button
                onClick={clearAllNotifications}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear all</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BellIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Notifications
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Unread
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Read
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px space-x-8">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: notifications.length - unreadCount },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2',
                    filter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    filter === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all'
                  ? "You're all caught up! No notifications to show."
                  : `No ${filter} notifications to show.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200',
                    !notification.read && 'ring-2 ring-primary/20 border-primary/30'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div className={cn('p-2 rounded-lg flex-shrink-0', colorClasses)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            'text-sm font-medium',
                            notification.read
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-900 dark:text-white'
                          )}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </h3>
                          <p className={cn(
                            'mt-1 text-sm',
                            notification.read
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-600 dark:text-gray-300'
                          )}>
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        
                        <Menu as="div" className="relative flex-shrink-0">
                          <Menu.Button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                          </Menu.Button>
                          
                          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                  className={cn(
                                    'w-full text-left px-4 py-2 text-sm',
                                    active
                                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  )}
                                >
                                  {notification.read ? 'Mark as unread' : 'Mark as read'}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className={cn(
                                    'w-full text-left px-4 py-2 text-sm',
                                    active
                                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                      : 'text-red-600 dark:text-red-400'
                                  )}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Menu>
                      </div>
                      
                      {notification.actionUrl && notification.actionText && (
                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = notification.actionUrl!}
                          >
                            {notification.actionText}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;