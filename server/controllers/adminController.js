const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const memoryStore = require('../services/store');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    if (isDbConnected()) {
      const totalUsers = await User.countDocuments();
      const totalLostItems = await Item.countDocuments({ type: 'lost' });
      const totalFoundItems = await Item.countDocuments({ type: 'found' });
      const resolvedItems = await Item.countDocuments({ status: { $in: ['resolved', 'claimed'] } });
      const pendingClaims = await Claim.countDocuments({ status: 'pending' });

      const recentItems = await Item.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email');

      return res.json({
        totalUsers,
        totalLostItems,
        totalFoundItems,
        resolvedItems,
        pendingClaims,
        recentItems,
      });
    } else {
      await memoryStore.init();
      const totalUsers = memoryStore.users.length;
      const totalLostItems = memoryStore.items.filter((i) => i.type === 'lost').length;
      const totalFoundItems = memoryStore.items.filter((i) => i.type === 'found').length;
      const resolvedItems = memoryStore.items.filter((i) => i.status === 'resolved' || i.status === 'claimed').length;
      const pendingClaims = memoryStore.claims.filter((c) => c.status === 'pending').length;
      const recentItems = memoryStore.items.slice(0, 5);

      return res.json({
        totalUsers,
        totalLostItems,
        totalFoundItems,
        resolvedItems,
        pendingClaims,
        recentItems,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    } else {
      await memoryStore.init();
      const users = memoryStore.users.map(({ password, ...rest }) => rest);
      return res.json(users);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items (reports)
// @route   GET /api/admin/items
// @access  Private/Admin
const getAllItems = async (req, res) => {
  try {
    if (isDbConnected()) {
      const items = await Item.find()
        .populate('user', 'name email studentId department')
        .sort({ createdAt: -1 });
      return res.json(items);
    } else {
      await memoryStore.init();
      return res.json(memoryStore.items);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item (admin content moderation)
// @route   DELETE /api/admin/items/:id
// @access  Private/Admin
const deleteItemAdmin = async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      await Claim.deleteMany({ item: req.params.id });
      await item.deleteOne();
      return res.json({ message: 'Item report and associated claims deleted by admin' });
    } else {
      await memoryStore.init();
      const idx = memoryStore.items.findIndex((i) => i._id.toString() === req.params.id.toString());
      if (idx !== -1) memoryStore.items.splice(idx, 1);
      return res.json({ message: 'Item deleted by admin' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserAdmin = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin account' });

      await Item.deleteMany({ user: req.params.id });
      await Claim.deleteMany({ claimant: req.params.id });
      await user.deleteOne();
      return res.json({ message: 'User account and associated records deleted' });
    } else {
      await memoryStore.init();
      const idx = memoryStore.users.findIndex((u) => u._id.toString() === req.params.id.toString());
      if (idx !== -1) memoryStore.users.splice(idx, 1);
      return res.json({ message: 'User account deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all claim requests for admin review
// @route   GET /api/admin/claims
// @access  Private/Admin
const getAllClaimsAdmin = async (req, res) => {
  try {
    if (isDbConnected()) {
      const claims = await Claim.find()
        .populate('item')
        .populate('claimant', 'name email studentId department')
        .sort({ createdAt: -1 });
      return res.json(claims);
    } else {
      await memoryStore.init();
      return res.json(memoryStore.claims);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllItems,
  deleteItemAdmin,
  deleteUserAdmin,
  getAllClaimsAdmin,
};
