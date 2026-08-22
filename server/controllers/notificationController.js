const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const AIMatch = require('../models/AIMatch');
const memoryStore = require('../services/store');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get user notifications with unread count
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const notifications = await Notification.find({ recipient: req.user._id })
        .populate('sender', 'name email department')
        .populate('item')
        .populate('matchingItem')
        .populate('matchId')
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false,
      });

      return res.json({
        notifications,
        unreadCount,
      });
    } else {
      await memoryStore.init();
      const list = (memoryStore.notifications || []).filter(
        (n) => (n.recipient._id || n.recipient).toString() === userId
      );
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const unreadCount = list.filter((n) => !n.isRead).length;

      return res.json({
        notifications: list,
        unreadCount,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const notif = await Notification.findOne({
        _id: id,
        recipient: req.user._id,
      });

      if (!notif) return res.status(404).json({ message: 'Notification not found' });

      notif.isRead = true;
      await notif.save();

      return res.json(notif);
    } else {
      await memoryStore.init();
      const notif = (memoryStore.notifications || []).find(
        (n) => n._id.toString() === id && (n.recipient._id || n.recipient).toString() === req.user._id.toString()
      );
      if (!notif) return res.status(404).json({ message: 'Notification not found' });

      notif.isRead = true;
      return res.json(notif);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
      return res.json({ message: 'All notifications marked as read' });
    } else {
      await memoryStore.init();
      (memoryStore.notifications || []).forEach((n) => {
        if ((n.recipient._id || n.recipient).toString() === userId) {
          n.isRead = true;
        }
      });
      return res.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle interactive action on notification (Accept / Reject match)
// @route   PATCH /api/notifications/:id/action
// @access  Private
const handleNotificationAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accepted' | 'rejected'

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be accepted or rejected.' });
    }

    if (isDbConnected()) {
      const notif = await Notification.findOne({
        _id: id,
        recipient: req.user._id,
      });

      if (!notif) return res.status(404).json({ message: 'Notification not found' });

      notif.actionStatus = action;
      notif.isRead = true;
      await notif.save();

      // If associated with a match record, update it too
      if (notif.matchId) {
        const matchStatus = action === 'accepted' ? 'confirmed' : 'rejected';
        await AIMatch.findByIdAndUpdate(notif.matchId, { status: matchStatus });
      }

      return res.json(notif);
    } else {
      await memoryStore.init();
      const notif = (memoryStore.notifications || []).find(
        (n) => n._id.toString() === id && (n.recipient._id || n.recipient).toString() === req.user._id.toString()
      );
      if (!notif) return res.status(404).json({ message: 'Notification not found' });

      notif.actionStatus = action;
      notif.isRead = true;

      if (notif.matchId) {
        const matchRecord = (memoryStore.matches || []).find(
          (m) => m._id.toString() === (notif.matchId._id || notif.matchId).toString()
        );
        if (matchRecord) {
          matchRecord.status = action === 'accepted' ? 'confirmed' : 'rejected';
        }
      }

      return res.json(notif);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const notif = await Notification.findOneAndDelete({
        _id: id,
        recipient: req.user._id,
      });

      if (!notif) return res.status(404).json({ message: 'Notification not found' });
      return res.json({ message: 'Notification deleted successfully' });
    } else {
      await memoryStore.init();
      const index = (memoryStore.notifications || []).findIndex(
        (n) => n._id.toString() === id && (n.recipient._id || n.recipient).toString() === req.user._id.toString()
      );

      if (index === -1) return res.status(404).json({ message: 'Notification not found' });
      memoryStore.notifications.splice(index, 1);
      return res.json({ message: 'Notification deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  handleNotificationAction,
  deleteNotification,
};
