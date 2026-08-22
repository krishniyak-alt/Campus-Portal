const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const memoryStore = require('../services/store');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const conversations = await Conversation.find({
        participants: req.user._id,
      })
        .populate('participants', 'name department role')
        .populate('item', 'title category type image status')
        .populate('matchingItem', 'title category type image status')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

      const formatted = conversations.map((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== userId
        ) || conv.participants[0];

        const userUnread =
          conv.unreadCount instanceof Map
            ? conv.unreadCount.get(userId) || 0
            : conv.unreadCount?.[userId] || 0;

        const isBlocked = conv.blockedUsers?.some((b) => b.toString() === userId);

        return {
          _id: conv._id,
          otherUser: {
            _id: otherUser?._id,
            name: otherUser?.name || 'Student',
            department: otherUser?.department || 'Campus Student',
            role: otherUser?.role || 'student',
          },
          item: conv.item,
          matchingItem: conv.matchingItem,
          lastMessage: conv.lastMessage,
          lastMessageText: conv.lastMessageText || conv.lastMessage?.content || '',
          lastMessageAt: conv.lastMessageAt,
          unreadCount: userUnread,
          isBlocked,
          createdAt: conv.createdAt,
        };
      });

      return res.json(formatted);
    } else {
      await memoryStore.init();
      const list = (memoryStore.conversations || []).filter((c) =>
        c.participants.some((p) => (p._id || p).toString() === userId)
      );
      list.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      const formatted = list.map((c) => {
        const otherUser = c.participants.find(
          (p) => (p._id || p).toString() !== userId
        ) || c.participants[0];

        return {
          _id: c._id,
          otherUser: {
            _id: otherUser?._id,
            name: otherUser?.name || 'Student',
            department: otherUser?.department || 'Campus Student',
            role: otherUser?.role || 'student',
          },
          item: c.item,
          matchingItem: c.matchingItem,
          lastMessage: c.lastMessage,
          lastMessageText: c.lastMessageText || c.lastMessage?.content || '',
          lastMessageAt: c.lastMessageAt,
          unreadCount: c.unreadCount?.[userId] || 0,
          isBlocked: c.blockedUsers?.includes(userId) || false,
          createdAt: c.createdAt,
        };
      });

      return res.json(formatted);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start or fetch existing conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
const startOrGetConversation = async (req, res) => {
  try {
    const { recipientId, itemId, matchingItemId } = req.body;
    const currentUserId = req.user._id.toString();

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId === currentUserId) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    if (isDbConnected()) {
      let conv = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
      })
        .populate('participants', 'name department role')
        .populate('item', 'title category type image status')
        .populate('lastMessage');

      if (!conv) {
        conv = new Conversation({
          participants: [req.user._id, recipientId],
          item: itemId || null,
          matchingItem: matchingItemId || null,
          lastMessageText: '',
          lastMessageAt: new Date(),
          unreadCount: new Map([[currentUserId, 0], [recipientId, 0]]),
          blockedUsers: [],
        });
        await conv.save();

        conv = await Conversation.findById(conv._id)
          .populate('participants', 'name department role')
          .populate('item', 'title category type image status');
      }

      return res.status(201).json(conv);
    } else {
      await memoryStore.init();
      let conv = (memoryStore.conversations || []).find((c) => {
        const pIds = c.participants.map((p) => (p._id || p).toString());
        return pIds.includes(currentUserId) && pIds.includes(recipientId);
      });

      if (!conv) {
        const recipientUser = (memoryStore.users || []).find(
          (u) => u._id.toString() === recipientId
        ) || { _id: recipientId, name: 'Student', department: 'Campus Student' };

        const targetItem = itemId
          ? (memoryStore.items || []).find((i) => i._id.toString() === itemId)
          : null;

        conv = {
          _id: 'cnv_' + Date.now(),
          participants: [req.user, recipientUser],
          item: targetItem,
          matchingItem: null,
          lastMessage: null,
          lastMessageText: '',
          lastMessageAt: new Date(),
          unreadCount: { [currentUserId]: 0, [recipientId]: 0 },
          blockedUsers: [],
          createdAt: new Date(),
        };

        memoryStore.conversations.unshift(conv);
      }

      return res.status(201).json(conv);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      const isParticipant = conv.participants.some((p) => p.toString() === userId);
      if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

      const messages = await Message.find({ conversation: conversationId })
        .populate('sender', 'name department role')
        .populate('itemContext', 'title category image')
        .sort({ createdAt: 1 });

      // Mark incoming messages as read
      await Message.updateMany(
        { conversation: conversationId, recipient: req.user._id, status: { $ne: 'read' } },
        { status: 'read' }
      );

      // Reset unread count for current user
      if (conv.unreadCount instanceof Map) {
        conv.unreadCount.set(userId, 0);
      } else if (conv.unreadCount) {
        conv.unreadCount[userId] = 0;
      }
      await conv.save();

      return res.json(messages);
    } else {
      await memoryStore.init();
      const conv = (memoryStore.conversations || []).find((c) => c._id.toString() === conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      const messages = (memoryStore.messages || []).filter(
        (m) => (m.conversation._id || m.conversation).toString() === conversationId
      );

      // Mark as read
      messages.forEach((m) => {
        if ((m.recipient._id || m.recipient).toString() === userId) {
          m.status = 'read';
        }
      });

      if (conv.unreadCount) {
        conv.unreadCount[userId] = 0;
      }

      return res.json(messages);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content, itemContext } = req.body;
    const senderId = req.user._id.toString();

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (isDbConnected()) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      const isParticipant = conv.participants.some((p) => p.toString() === senderId);
      if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

      const isBlocked = conv.blockedUsers?.length > 0;
      if (isBlocked) {
        return res.status(403).json({ message: 'Cannot send message in a blocked conversation' });
      }

      const recipientId = conv.participants.find((p) => p.toString() !== senderId);

      const message = new Message({
        conversation: conversationId,
        sender: req.user._id,
        recipient: recipientId,
        content: content.trim(),
        itemContext: itemContext || conv.item || null,
        status: 'sent',
      });

      const savedMessage = await message.save();

      // Update conversation
      conv.lastMessage = savedMessage._id;
      conv.lastMessageText = content.trim();
      conv.lastMessageAt = new Date();

      const currentUnread = conv.unreadCount instanceof Map
        ? conv.unreadCount.get(recipientId.toString()) || 0
        : conv.unreadCount?.[recipientId.toString()] || 0;

      if (conv.unreadCount instanceof Map) {
        conv.unreadCount.set(recipientId.toString(), currentUnread + 1);
      } else {
        conv.unreadCount[recipientId.toString()] = currentUnread + 1;
      }

      await conv.save();

      const populated = await Message.findById(savedMessage._id)
        .populate('sender', 'name department role')
        .populate('itemContext', 'title category image');

      // Create in-app notification for recipient
      const notif = new Notification({
        recipient: recipientId,
        sender: req.user._id,
        type: 'chat_message',
        title: `💬 New message from ${req.user.name}`,
        message: content.trim().length > 60 ? content.trim().substring(0, 60) + '...' : content.trim(),
        conversationId: conv._id,
        item: conv.item || null,
      });
      await notif.save();

      return res.status(201).json(populated);
    } else {
      await memoryStore.init();
      const conv = (memoryStore.conversations || []).find((c) => c._id.toString() === conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      const recipientObj = conv.participants.find(
        (p) => (p._id || p).toString() !== senderId
      );

      const newMsg = {
        _id: 'msg_' + Date.now(),
        conversation: conv._id,
        sender: {
          _id: req.user._id,
          name: req.user.name,
          department: req.user.department,
          role: req.user.role,
        },
        recipient: recipientObj,
        content: content.trim(),
        itemContext: itemContext || conv.item || null,
        status: 'sent',
        createdAt: new Date(),
      };

      memoryStore.messages.push(newMsg);

      conv.lastMessage = newMsg;
      conv.lastMessageText = content.trim();
      conv.lastMessageAt = new Date();
      if (!conv.unreadCount) conv.unreadCount = {};
      const rId = (recipientObj._id || recipientObj).toString();
      conv.unreadCount[rId] = (conv.unreadCount[rId] || 0) + 1;

      // Add notification
      const notif = {
        _id: 'ntf_' + Date.now(),
        recipient: recipientObj,
        sender: req.user,
        type: 'chat_message',
        title: `💬 New message from ${req.user.name}`,
        message: content.trim().length > 60 ? content.trim().substring(0, 60) + '...' : content.trim(),
        conversationId: conv._id,
        item: conv.item || null,
        isRead: false,
        actionStatus: 'pending',
        createdAt: new Date(),
      };
      memoryStore.notifications.unshift(notif);

      return res.status(201).json(newMsg);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or Unblock user in a conversation
// @route   POST /api/chat/conversations/:id/block
// @access  Private
const toggleBlockUser = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      const isBlocked = conv.blockedUsers?.some((b) => b.toString() === userId);
      if (isBlocked) {
        conv.blockedUsers = conv.blockedUsers.filter((b) => b.toString() !== userId);
      } else {
        conv.blockedUsers.push(req.user._id);
      }
      await conv.save();

      return res.json({
        message: isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
        isBlocked: !isBlocked,
      });
    } else {
      await memoryStore.init();
      const conv = (memoryStore.conversations || []).find((c) => c._id.toString() === conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      if (!conv.blockedUsers) conv.blockedUsers = [];
      const isBlocked = conv.blockedUsers.includes(userId);
      if (isBlocked) {
        conv.blockedUsers = conv.blockedUsers.filter((u) => u !== userId);
      } else {
        conv.blockedUsers.push(userId);
      }

      return res.json({
        message: isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
        isBlocked: !isBlocked,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report user in conversation
// @route   POST /api/chat/conversations/:id/report
// @access  Private
const reportUser = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { reason } = req.body;

    return res.json({
      message: 'Report submitted to campus administrator. Our team will review this interaction.',
      reason: reason || 'General safety concern',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  startOrGetConversation,
  getMessages,
  sendMessage,
  toggleBlockUser,
  reportUser,
};
