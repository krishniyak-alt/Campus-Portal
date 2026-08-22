import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loading from '../components/Loading';
import {
  Bell,
  Sparkles,
  MessageSquare,
  FileCheck,
  Check,
  X,
  Trash2,
  ArrowLeft,
  CheckCheck,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleAction = async (notifId, action) => {
    try {
      await API.patch('/notifications/' + notifId + '/action', { action });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, actionStatus: action, isRead: true } : n))
      );
      toast.success(action === 'accepted' ? 'Match confirmed!' : 'Match rejected');
    } catch (error) {
      toast.error('Failed to update action');
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await API.delete('/notifications/' + notifId);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotifStyle = (notif) => {
    const isHigh = (notif.matchScore || 0) >= 80;
    switch (notif.type) {
      case 'ai_match':
        return {
          iconBg: isHigh ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
          cardBg: !notif.isRead ? 'bg-indigo-50/50 border-indigo-200/80 shadow-sm' : 'bg-white border-slate-200/80',
          Icon: Sparkles,
        };
      case 'chat_message':
        return { iconBg: 'bg-blue-100 text-blue-600', cardBg: !notif.isRead ? 'bg-blue-50/50 border-blue-200/80 shadow-sm' : 'bg-white border-slate-200/80', Icon: MessageSquare };
      case 'claim_submitted':
        return { iconBg: 'bg-amber-100 text-amber-600', cardBg: !notif.isRead ? 'bg-amber-50/50 border-amber-200/80 shadow-sm' : 'bg-white border-slate-200/80', Icon: ClipboardList };
      case 'claim_approved':
        return { iconBg: 'bg-emerald-100 text-emerald-600', cardBg: !notif.isRead ? 'bg-emerald-50/50 border-emerald-200/80 shadow-sm' : 'bg-white border-slate-200/80', Icon: ShieldCheck };
      case 'claim_rejected':
        return { iconBg: 'bg-rose-100 text-rose-600', cardBg: !notif.isRead ? 'bg-rose-50/50 border-rose-200/80 shadow-sm' : 'bg-white border-slate-200/80', Icon: ShieldAlert };
      default:
        return { iconBg: 'bg-indigo-100 text-indigo-600', cardBg: !notif.isRead ? 'bg-indigo-50/50 border-indigo-200/80 shadow-sm' : 'bg-white border-slate-200/80', Icon: FileCheck };
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Notifications &amp; Alerts</h1>
            <p className="text-xs text-slate-500">AI match alerts, claim requests, and chat messages.</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all">
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You are all caught up! Alerts will appear here.</p>
          <Link to="/browse" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Active Directory</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const { iconBg, cardBg, Icon } = getNotifStyle(notif);
            const isMatch = notif.type === 'ai_match';
            const isChat = notif.type === 'chat_message';
            const isClaimSubmitted = notif.type === 'claim_submitted';
            const isClaimApproved = notif.type === 'claim_approved';
            const isClaimRejected = notif.type === 'claim_rejected';
            const isHigh = (notif.matchScore || 0) >= 80;

            return (
              <div key={notif._id} className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBg}`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900">{notif.title}</h4>
                      {notif.matchScore && (
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isHigh ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                          {notif.matchScore}% Match
                        </span>
                      )}
                      {isClaimSubmitted && <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">New Claim</span>}
                      {isClaimApproved && <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">Approved ✓</span>}
                      {isClaimRejected && <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">Rejected</span>}
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap justify-end">
                  {isMatch && notif.matchId && (
                    <button onClick={() => navigate('/matches/' + (notif.matchId._id || notif.matchId))} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all">
                      <Sparkles className="w-3.5 h-3.5" /><span>View Match</span>
                    </button>
                  )}
                  {isMatch && notif.actionStatus === 'pending' && (
                    <>
                      <button onClick={() => handleAction(notif._id, 'accepted')} className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-1 transition-all">
                        <Check className="w-3.5 h-3.5" /><span>Confirm</span>
                      </button>
                      <button onClick={() => handleAction(notif._id, 'rejected')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-all">
                        <X className="w-3.5 h-3.5" /><span>Dismiss</span>
                      </button>
                    </>
                  )}
                  {isChat && (
                    <button onClick={() => { const c = notif.conversationId?._id || notif.conversationId; navigate(c ? '/chat/' + c : '/chat'); }} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all">
                      <MessageSquare className="w-3.5 h-3.5" /><span>Open Chat</span>
                    </button>
                  )}
                  {isClaimSubmitted && (
                    <button onClick={() => navigate('/dashboard')} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all">
                      <ClipboardList className="w-3.5 h-3.5" /><span>Review Claim</span>
                    </button>
                  )}
                  {isClaimApproved && notif.item && (
                    <button onClick={() => navigate('/items/' + (notif.item._id || notif.item))} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all">
                      <ShieldCheck className="w-3.5 h-3.5" /><span>View Item</span>
                    </button>
                  )}
                  {isClaimRejected && (
                    <button onClick={() => navigate('/chat')} className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all">
                      <MessageSquare className="w-3.5 h-3.5" /><span>Contact via Chat</span>
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Delete notification">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
