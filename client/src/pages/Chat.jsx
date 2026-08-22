import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Loading from '../components/Loading';
import {
  MessageSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Flag,
  ArrowLeft,
  ExternalLink,
  Tag,
  Sparkles,
  Info,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch all conversations for user
  const fetchConversations = async () => {
    try {
      const { data } = await API.get('/chat/conversations');
      setConversations(data || []);

      if (conversationId) {
        const target = data.find((c) => c._id === conversationId);
        if (target) {
          setActiveConversation(target);
        }
      } else if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const { data } = await API.get(`/chat/conversations/${convId}/messages`);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      const msgInterval = setInterval(() => fetchMessages(activeConversation._id), 3000);
      return () => clearInterval(msgInterval);
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    navigate(`/chat/${conv._id}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || sending) return;

    const content = messageText.trim();
    setMessageText('');
    setSending(true);

    // Optimistic UI update
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender: { _id: user._id, name: user.name },
      content,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data } = await API.post(`/chat/conversations/${activeConversation._id}/messages`, {
        content,
        itemContext: activeConversation.item?._id,
      });

      // Replace optimistic message with actual response
      setMessages((prev) => prev.map((m) => (m._id === optimisticMsg._id ? data : m)));
      fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!activeConversation) return;
    try {
      const { data } = await API.post(`/chat/conversations/${activeConversation._id}/block`);
      toast.success(data.message);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to update block status');
    }
  };

  const handleReportUser = async () => {
    if (!activeConversation) return;
    const reason = prompt('Please enter the reason for reporting this user:');
    if (!reason) return;

    try {
      const { data } = await API.post(`/chat/conversations/${activeConversation._id}/report`, {
        reason,
      });
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Container Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[680px] max-h-[820px]">
        {/* Left Panel: Conversation List (4 cols) */}
        <div className={`md:col-span-4 border-r border-slate-200/80 flex flex-col justify-between bg-slate-50/50 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          <div>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">Direct Messages</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {conversations.length} Chats
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search chats or items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="overflow-y-auto max-h-[560px] divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">No conversations found</p>
                  <p className="text-[11px] text-slate-400">
                    Start a chat from any lost or found item page or AI match notification.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversation?._id === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 hover:bg-slate-100/70 transition-colors cursor-pointer space-y-2 ${
                        isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center uppercase shrink-0 shadow-sm">
                            {conv.otherUser?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {conv.otherUser?.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {conv.otherUser?.department || 'Campus Student'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="text-[9px] text-slate-400 block">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-indigo-600 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Preview pill */}
                      {conv.item && (
                        <div className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-[10px] text-slate-600 flex items-center space-x-1.5 truncate">
                          <Tag className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">Regarding: {conv.item.title}</span>
                        </div>
                      )}

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.lastMessageText || 'No messages yet. Say hello!'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-100/80 border-t border-slate-200 text-[10px] text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Private student-to-student messaging. Private contact numbers are protected.</span>
          </div>
        </div>

        {/* Right Panel: Active Chat Thread (8 cols) */}
        <div className={`md:col-span-8 flex flex-col justify-between h-full ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center uppercase shadow-md shadow-indigo-500/20 shrink-0">
                    {activeConversation.otherUser?.name?.charAt(0) || 'U'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate flex items-center space-x-1.5">
                      <span>{activeConversation.otherUser?.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
                        {activeConversation.otherUser?.department || 'Student'}
                      </span>
                    </h3>
                    {activeConversation.item && (
                      <Link
                        to={`/items/${activeConversation.item._id}`}
                        target="_blank"
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 truncate"
                      >
                        <span>Item: {activeConversation.item.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Safety & Action Menu */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleToggleBlock}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors text-xs font-semibold flex items-center space-x-1"
                    title="Block or Unblock user"
                  >
                    <Ban className="w-4 h-4" />
                    <span className="hidden sm:inline">Block</span>
                  </button>

                  <button
                    onClick={handleReportUser}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center space-x-1"
                    title="Report user to Admin"
                  >
                    <Flag className="w-4 h-4" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                </div>
              </div>

              {/* Message Thread Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/40 space-y-4">
                {/* Safety banner */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Campus Safety Tip:</strong> Always arrange handoffs in public campus locations (e.g. Library Reception, Security Desk, or Department Offices).
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-indigo-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Start the conversation</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Coordinate item return, verify identifying characteristics, or arrange a safe handover spot.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = (msg.sender?._id || msg.sender).toString();
                    const isMine = senderId === user._id.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Metadata: timestamp + read checkmark */}
                        <div className="flex items-center space-x-1.5 pt-1 px-1 text-[9px] text-slate-400">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span>
                              {msg.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-indigo-600 inline" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-105"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Select a Chat</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Choose a conversation from the left panel or click "Start Chat" on any AI match or item report.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
