import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CreditCard,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Navbar = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          const list = res.data.data.notifications || [];
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        // Silently handle if notifications endpoint error
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId, e) => {
    e?.stopPropagation();
    try {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      if (res.data?.success || res.status === 200) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }
    if (n.linkUrl) {
      setShowNotifications(false);
      navigate(n.linkUrl);
    }
  };

  const getNotificationMeta = (n) => {
    const titleLower = (n.title || '').toLowerCase();
    const isTaskDeadline =
      titleLower.includes('task') || n.linkUrl?.includes('/tasks');
    const isProjectDeadline =
      !isTaskDeadline &&
      (n.type === 'DEADLINE_WARNING' ||
        titleLower.includes('project') ||
        n.linkUrl?.includes('/projects'));
    const isPayment =
      n.type === 'PAYMENT_DUE' ||
      titleLower.includes('payment') ||
      titleLower.includes('invoice') ||
      n.linkUrl?.includes('/payments');

    if (isTaskDeadline) {
      return {
        category: 'Task Deadline',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      };
    }
    if (isProjectDeadline) {
      return {
        category: 'Project Deadline',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />,
      };
    }
    if (isPayment) {
      return {
        category: 'Payment Overdue',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <CreditCard className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
      };
    }
    return {
      category: 'Update',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />,
    };
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 print:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">{title || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay for clicking outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 z-50 w-80 sm:w-[400px] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-10 px-6 text-center">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        You have no unread notifications or approaching deadlines.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const meta = getNotificationMeta(n);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 transition-colors cursor-pointer group ${
                            n.isRead
                              ? 'bg-white hover:bg-slate-50/80'
                              : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {meta.icon}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}
                                >
                                  {meta.category}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                  {!n.isRead && (
                                    <span
                                      className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"
                                      title="Unread"
                                    />
                                  )}
                                </div>
                              </div>

                              <p
                                className={`text-xs font-semibold line-clamp-1 ${
                                  n.isRead ? 'text-slate-700' : 'text-slate-900 font-bold'
                                }`}
                              >
                                {n.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>

                              {/* Actions footer */}
                              <div className="flex items-center justify-between mt-2 pt-1 text-[11px]">
                                {n.linkUrl ? (
                                  <span className="text-indigo-600 hover:text-indigo-800 font-medium group-hover:underline">
                                    View details &rarr;
                                  </span>
                                ) : (
                                  <span />
                                )}

                                {!n.isRead && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(n.id, e)}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 px-2 py-0.5 rounded hover:bg-slate-200/60 transition"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3 h-3 text-indigo-600" />
                                    <span>Mark as read</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
            {user?.fullName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

