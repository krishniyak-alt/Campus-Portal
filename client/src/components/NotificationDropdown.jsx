import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  MessageSquare,
  FileCheck,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 10 seconds for real-time alerts
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await API.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }

    setOpen(false);

    if (notif.type === 'ai_match') {
      if (notif.matchId) {
        const mId = notif.matchId._id || notif.matchId;
        navigate(`/matches/${mId}`);
      } else if (notif.item) {
        const itemId = notif.item._id || notif.item;
        navigate(`/items/${itemId}`);
      }
    } else if (notif.type === 'chat_message') {
      const convId = notif.conversationId?._id || notif.conversationId;
      navigate(convId ? `/chat/${convId}` : '/chat');
    } else if (notif.item) {
      const itemId = notif.item._id || notif.item;
      navigate(`/items/${itemId}`);
    }
  };

  const handleAction = async (e, notifId, action) => {
    e.stopPropagation();
    try {
      await API.patch(`/notifications/${notifId}/action`, { action });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, actionStatus: action, isRead: true } : n))
      );
      toast.success(action === 'accepted' ? 'Match confirmed!' : 'Match rejected');
    } catch (error) {
      toast.error('Failed to update action');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-none">Notifications</h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No notifications yet</p>
                <p className="text-[10px] text-slate-400">
                  AI matching alerts and chat messages will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isMatch = notif.type === 'ai_match';
                const isChat = notif.type === 'chat_message';
                const isClaim = notif.type === 'claim_update';
                const isHigh = notif.matchScore >= 80;

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer space-y-2 ${
                      !notif.isRead ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isMatch
                            ? isHigh
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                            : isChat
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}
                      >
                        {isMatch ? (
                          <Sparkles className="w-4 h-4" />
                        ) : isChat ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : (
                          <FileCheck className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {notif.title}
                          </p>
                          {notif.matchScore && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                isHigh
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {notif.matchScore}%
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {notif.message}
                        </p>

                        <span className="text-[9px] text-slate-400 block pt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Quick interactive actions for AI Match */}
                    {isMatch && notif.actionStatus === 'pending' && (
                      <div className="pt-1.5 flex items-center justify-end space-x-2 pl-9">
                        <button
                          onClick={(e) => handleAction(e, notif._id, 'accepted')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm transition-all"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={(e) => handleAction(e, notif._id, 'rejected')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <X className="w-3 h-3" />
                          <span>Not Mine</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
            >
              <span>View All Notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
