'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Settings, Filter, Heart, FileText, Users, CheckCircle, DollarSign } from 'lucide-react';

interface Notification {
  id: string;
  type: 'donation' | 'approval' | 'program' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: any;
  iconColor: string;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'donation',
      title: 'New Donation Received',
      message: 'Rp 500.000 donated to "Bantuan Pendidikan Anak Yatim"',
      timestamp: '5 minutes ago',
      read: false,
      icon: DollarSign,
      iconColor: 'text-green-600 bg-green-100',
    },
    {
      id: '2',
      type: 'approval',
      title: 'Program Needs Approval',
      message: 'New program "Bantuan Korban Banjir" is waiting for your review',
      timestamp: '1 hour ago',
      read: false,
      icon: CheckCircle,
      iconColor: 'text-amber-600 bg-amber-100',
    },
    {
      id: '3',
      type: 'program',
      title: 'Program Goal Reached',
      message: 'Program "Renovasi Masjid Al-Ikhlas" has reached 100% of target',
      timestamp: '2 hours ago',
      read: true,
      icon: Heart,
      iconColor: 'text-teal-600 bg-teal-100',
    },
    {
      id: '4',
      type: 'system',
      title: 'New Report Submitted',
      message: 'Laporan penyaluran bantuan has been submitted for approval',
      timestamp: '3 hours ago',
      read: true,
      icon: FileText,
      iconColor: 'text-cyan-600 bg-cyan-100',
    },
    {
      id: '5',
      type: 'approval',
      title: 'New User Registration',
      message: 'Ahmad Budiman registered as proposer and needs verification',
      timestamp: '1 day ago',
      read: true,
      icon: Users,
      iconColor: 'text-purple-600 bg-purple-100',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 && <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-pulse-slow mr-1"></span>}
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all hover-lift"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all hover-lift">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-fadeIn animate-stagger-1">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all hover-scale ${
                filter === 'all'
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all hover-scale ${
                filter === 'unread'
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 animate-fadeIn animate-stagger-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-all hover:border-l-4 hover:border-teal-500 group ${
                  !notification.read ? 'bg-teal-50/30' : ''
                }`}
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${notification.iconColor} transition-all group-hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-teal-500 rounded-full animate-pulse-slow"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all hover:scale-110"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
