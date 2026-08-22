const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
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
      const item = await Item.findById(itemId);
      if (!item) return res.status(404).json({ message: 'Target item not found' });

      if (item.user.toString() === req.user._id.toString()) {
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
      const claim = await Claim.findById(req.params.id).populate('item');
      if (!claim) return res.status(404).json({ message: 'Claim not found' });

      claim.status = status;
      await claim.save();

      if (status === 'approved') {
        claim.item.status = 'claimed';
        await claim.item.save();
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
