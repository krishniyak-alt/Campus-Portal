const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const memoryStore = require('../services/store');
const { handleImageUpload } = require('../middleware/uploadMiddleware');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Submit a claim for an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item: itemId, message, identifyingDetails } = req.body;

    let proofImageUrl = '';
    if (req.file) {
      proofImageUrl = await handleImageUpload(req.file, req);
    }

    if (isDbConnected()) {
      const item = await Item.findById(itemId).populate('user', 'name department');
      if (!item) return res.status(404).json({ message: 'Target item not found' });

      if (item.user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot claim an item posted by yourself' });
      }

      const existingClaim = await Claim.findOne({
        item: itemId,
        claimant: req.user._id,
        status: 'pending',
      });

      if (existingClaim) {
        return res.status(400).json({ message: 'You already have a pending claim for this item' });
      }

      const claim = new Claim({
        item: itemId,
        claimant: req.user._id,
        message,
        identifyingDetails,
        proofImage: proofImageUrl,
      });

      const savedClaim = await claim.save();
      const populated = await Claim.findById(savedClaim._id)
        .populate('item')
        .populate('claimant', 'name email studentId department');

      // 🔔 Notify the item owner about the new claim
      try {
        await Notification.create({
          recipient: item.user._id,
          sender: req.user._id,
          type: 'claim_submitted',
          title: `📋 New Claim on "${item.title}"`,
          message: `${req.user.name} (${req.user.department}) has submitted a claim request for your ${item.type} item "${item.title}". Please review it in your dashboard.`,
          item: item._id,
          isRead: false,
        });
      } catch (notifErr) {
        console.warn('Notification creation failed (non-blocking):', notifErr.message);
      }

      return res.status(201).json(populated);
    } else {
      await memoryStore.init();
      const item = memoryStore.items.find((i) => i._id.toString() === itemId.toString());
      if (!item) return res.status(404).json({ message: 'Target item not found' });

      if (item.user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot claim an item posted by yourself' });
      }

      const newClaim = {
        _id: 'clm_' + Date.now(),
        item,
        claimant: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          studentId: req.user.studentId,
          department: req.user.department,
        },
        message,
        identifyingDetails,
        proofImage: proofImageUrl,
        status: 'pending',
        createdAt: new Date(),
      };

      memoryStore.claims.unshift(newClaim);

      // 🔔 Notify item owner (memory store fallback)
      try {
        const ownerId = (item.user._id || item.user).toString();
        memoryStore.notifications.unshift({
          _id: 'notif_claim_' + Date.now(),
          recipient: { _id: ownerId },
          sender: { _id: req.user._id, name: req.user.name },
          type: 'claim_submitted',
          title: `📋 New Claim on "${item.title}"`,
          message: `${req.user.name} has submitted a claim request for your ${item.type} item "${item.title}".`,
          item: { _id: item._id, title: item.title },
          isRead: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.warn('Memory notification failed:', notifErr.message);
      }

      return res.status(201).json(newClaim);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get current user's submitted claims
// @route   GET /api/claims/my-claims
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    if (isDbConnected()) {
      const claims = await Claim.find({ claimant: req.user._id })
        .populate({
          path: 'item',
          populate: { path: 'user', select: 'name email department' },
        })
        .sort({ createdAt: -1 });

      return res.json(claims);
    } else {
      await memoryStore.init();
      const claims = memoryStore.claims.filter(
        (c) => c.claimant._id.toString() === req.user._id.toString()
      );
      return res.json(claims);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claims for a specific item (for item poster or admin)
// @route   GET /api/claims/item/:itemId
// @access  Private
const getItemClaims = async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view claims for this item' });
      }

      const claims = await Claim.find({ item: req.params.itemId })
        .populate('claimant', 'name email studentId department')
        .sort({ createdAt: -1 });

      return res.json(claims);
    } else {
      await memoryStore.init();
      const claims = memoryStore.claims.filter(
        (c) => c.item._id.toString() === req.params.itemId.toString()
      );
      return res.json(claims);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject claim
// @route   PATCH /api/claims/:id
// @access  Private (Item poster or Admin)
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      const claim = await Claim.findById(req.params.id)
        .populate('item')
        .populate('claimant', 'name email department');
      if (!claim) return res.status(404).json({ message: 'Claim not found' });

      claim.status = status;
      await claim.save();

      if (status === 'approved') {
        claim.item.status = 'claimed';
        await claim.item.save();
      }

      // 🔔 Notify the claimant about approval or rejection
      try {
        const isApproved = status === 'approved';
        await Notification.create({
          recipient: claim.claimant._id,
          sender: req.user._id,
          type: isApproved ? 'claim_approved' : 'claim_rejected',
          title: isApproved
            ? `✅ Claim Approved: "${claim.item.title}"`
            : `❌ Claim Rejected: "${claim.item.title}"`,
          message: isApproved
            ? `Your ownership claim for "${claim.item.title}" has been approved! Please coordinate the collection with the reporter.`
            : `Your ownership claim for "${claim.item.title}" was not approved at this time. You may reach out via chat for more information.`,
          item: claim.item._id,
          isRead: false,
        });
      } catch (notifErr) {
        console.warn('Claim status notification failed (non-blocking):', notifErr.message);
      }

      return res.json(claim);
    } else {
      await memoryStore.init();
      const claim = memoryStore.claims.find((c) => c._id.toString() === req.params.id.toString());
      if (!claim) return res.status(404).json({ message: 'Claim not found' });

      claim.status = status;
      if (status === 'approved' && claim.item) {
        claim.item.status = 'claimed';
      }

      // 🔔 Notify claimant in memory store
      try {
        const claimantId = (claim.claimant._id || claim.claimant).toString();
        const isApproved = status === 'approved';
        memoryStore.notifications.unshift({
          _id: 'notif_claimstatus_' + Date.now(),
          recipient: { _id: claimantId },
          sender: { _id: req.user._id, name: req.user.name },
          type: isApproved ? 'claim_approved' : 'claim_rejected',
          title: isApproved ? `✅ Claim Approved` : `❌ Claim Rejected`,
          message: isApproved
            ? `Your claim has been approved! Coordinate the collection.`
            : `Your claim was not approved at this time.`,
          item: claim.item ? { _id: claim.item._id, title: claim.item.title } : null,
          isRead: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.warn('Memory claim status notification failed:', notifErr.message);
      }

      return res.json(claim);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
};
