import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Settings, CheckCheck, Sparkles } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';
import { Notification, NotificationPriority } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const unread = await notificationService.getUnreadNotifications();
      setNotifications(unread);
    } catch (error) {
      logger.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      logger.error('Failed to delete notification:', error);
    }
  };

  const getPriorityConfig = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return { 
          bg: 'bg-red-50', 
          border: 'border-l-red-500', 
          badge: 'bg-red-500 text-white',
          text: 'text-red-900'
        };
      case 'HIGH':
        return { 
          bg: 'bg-orange-50', 
          border: 'border-l-orange-500', 
          badge: 'bg-orange-500 text-white',
          text: 'text-orange-900'
        };
      case 'NORMAL':
        return { 
          bg: 'bg-indigo-50', 
          border: 'border-l-blue-500', 
          badge: 'bg-blue-500 text-white',
          text: 'text-indigo-900'
        };
      case 'LOW':
        return { 
          bg: 'bg-slate-50', 
          border: 'border-l-slate-400', 
          badge: 'bg-slate-400 text-white',
          text: 'text-slate-800'
        };
      default:
        return { 
          bg: 'bg-slate-50', 
          border: 'border-l-slate-400', 
          badge: 'bg-slate-400 text-white',
          text: 'text-slate-800'
        };
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close notifications"
      />

      {/* Notification Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              {notifications.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 text-white text-sm font-semibold rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenSettings}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Notification Settings"
              >
                <Settings className="h-5 w-5 text-white/90" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white/90" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-4 text-gray-500 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-800">No new notifications</p>
              <p className="text-sm text-gray-500 mt-1 text-center">
                You're all caught up! We'll notify you when something new arrives.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => {
                const priorityConfig = getPriorityConfig(notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-colors hover:bg-gray-50 ${priorityConfig.bg} ${priorityConfig.border}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`text-sm font-semibold ${priorityConfig.text}`}>
                            {notification.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig.badge}`}>
                            {notification.priority}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 text-gray-500 hover:text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onOpenSettings}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            Notification Settings
          </button>
        </div>
      </div>
    </>
  );
};
