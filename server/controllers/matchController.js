const mongoose = require('mongoose');
const Item = require('../models/Item');
const AIMatch = require('../models/AIMatch');
const Notification = require('../models/Notification');
const memoryStore = require('../services/store');
const { matchItems } = require('../services/aiMatcher');
const matchingConfig = require('../config/matchingConfig');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Core engine: Compare a newly created/updated item against all complementary items
 */
const analyzeItemMatches = async (targetItem) => {
  try {
    const isLost = targetItem.type === 'lost';
    const complementaryType = isLost ? 'found' : 'lost';

    let candidates = [];
    if (isDbConnected()) {
      candidates = await Item.find({
        type: complementaryType,
        status: 'active',
        _id: { $ne: targetItem._id },
      }).populate('user', 'name email department studentId');
    } else {
      await memoryStore.init();
      candidates = (memoryStore.items || []).filter(
        (i) => i.type === complementaryType && i.status === 'active' && i._id.toString() !== targetItem._id.toString()
      );
    }

    const createdMatches = [];

    for (const candidate of candidates) {
      const lostItem = isLost ? targetItem : candidate;
      const foundItem = isLost ? candidate : targetItem;

      // Run AI similarity evaluation
      const result = await matchItems(lostItem, foundItem);

      // If score is at or above possibleMatch threshold (60%), save match and notify
      if (result.overallScore >= matchingConfig.thresholds.possibleMatch) {
        if (isDbConnected()) {
          // Check if match already exists
          let matchRecord = await AIMatch.findOne({
            lostItem: lostItem._id,
            foundItem: foundItem._id,
          });

          if (!matchRecord) {
            matchRecord = new AIMatch({
              lostItem: lostItem._id,
              foundItem: foundItem._id,
              overallScore: result.overallScore,
              matchGrade: result.matchGrade,
              summaryExplanation: result.summaryExplanation,
              factors: result.factors,
              status: 'pending',
            });
            await matchRecord.save();
          } else {
            matchRecord.overallScore = result.overallScore;
            matchRecord.matchGrade = result.matchGrade;
            matchRecord.summaryExplanation = result.summaryExplanation;
            matchRecord.factors = result.factors;
            await matchRecord.save();
          }

          // Create notification for Lost Item owner
          const lostUserId = lostItem.user._id || lostItem.user;
          const foundUserId = foundItem.user._id || foundItem.user;

          const lostUserNotif = new Notification({
            recipient: lostUserId,
            sender: foundUserId,
            type: 'ai_match',
            title: `🔔 ${result.matchGrade}: Lost Item Match Found`,
            message: `Your lost item "${lostItem.title}" matches a found item (${result.overallScore}% match).`,
            item: lostItem._id,
            matchingItem: foundItem._id,
            matchId: matchRecord._id,
            matchScore: result.overallScore,
            matchGrade: result.matchGrade,
          });
          await lostUserNotif.save();

          // Create notification for Found Item reporter
          const foundUserNotif = new Notification({
            recipient: foundUserId,
            sender: lostUserId,
            type: 'ai_match',
            title: `🔔 ${result.matchGrade}: Potential Owner Identified`,
            message: `A reported lost item "${lostItem.title}" may match the "${foundItem.title}" you found (${result.overallScore}% match).`,
            item: foundItem._id,
            matchingItem: lostItem._id,
            matchId: matchRecord._id,
            matchScore: result.overallScore,
            matchGrade: result.matchGrade,
          });
          await foundUserNotif.save();

          createdMatches.push(matchRecord);
        } else {
          // In-memory fallback
          await memoryStore.init();
          const matchRecord = {
            _id: 'mtc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            lostItem,
            foundItem,
            overallScore: result.overallScore,
            matchGrade: result.matchGrade,
            summaryExplanation: result.summaryExplanation,
            factors: result.factors,
            status: 'pending',
            createdAt: new Date(),
          };
          memoryStore.matches.unshift(matchRecord);

          const notif1 = {
            _id: 'ntf_' + Date.now() + '_1',
            recipient: lostItem.user,
            sender: foundItem.user,
            type: 'ai_match',
            title: `🔔 ${result.matchGrade}: Lost Item Match Found`,
            message: `Your lost item "${lostItem.title}" matches a found item (${result.overallScore}% match).`,
            item: lostItem,
            matchingItem: foundItem,
            matchId: matchRecord,
            matchScore: result.overallScore,
            matchGrade: result.matchGrade,
            isRead: false,
            actionStatus: 'pending',
            createdAt: new Date(),
          };

          const notif2 = {
            _id: 'ntf_' + Date.now() + '_2',
            recipient: foundItem.user,
            sender: lostItem.user,
            type: 'ai_match',
            title: `🔔 ${result.matchGrade}: Potential Owner Identified`,
            message: `A reported lost item "${lostItem.title}" may match the "${foundItem.title}" you found (${result.overallScore}% match).`,
            item: foundItem,
            matchingItem: lostItem,
            matchId: matchRecord,
            matchScore: result.overallScore,
            matchGrade: result.matchGrade,
            isRead: false,
            actionStatus: 'pending',
            createdAt: new Date(),
          };

          memoryStore.notifications.unshift(notif1, notif2);
          createdMatches.push(matchRecord);
        }
      }
    }

    return createdMatches;
  } catch (error) {
    console.error('[AI Match Analysis Error]:', error);
    return [];
  }
};

// @desc    Get all matches for a specific item
// @route   GET /api/matches/item/:itemId
// @access  Public / Private
const getItemMatches = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (isDbConnected()) {
      const matches = await AIMatch.find({
        $or: [{ lostItem: itemId }, { foundItem: itemId }],
        overallScore: { $gte: matchingConfig.thresholds.possibleMatch },
      })
        .populate({
          path: 'lostItem',
          populate: { path: 'user', select: 'name email department' },
        })
        .populate({
          path: 'foundItem',
          populate: { path: 'user', select: 'name email department' },
        })
        .sort({ overallScore: -1 });

      return res.json(matches);
    } else {
      await memoryStore.init();
      const matches = (memoryStore.matches || []).filter(
        (m) =>
          (m.lostItem._id.toString() === itemId || m.foundItem._id.toString() === itemId) &&
          m.overallScore >= matchingConfig.thresholds.possibleMatch
      );
      matches.sort((a, b) => b.overallScore - a.overallScore);
      return res.json(matches);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single match comparison details
// @route   GET /api/matches/:id
// @access  Public / Private
const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const match = await AIMatch.findById(id)
        .populate({
          path: 'lostItem',
          populate: { path: 'user', select: 'name email department' },
        })
        .populate({
          path: 'foundItem',
          populate: { path: 'user', select: 'name email department' },
        });

      if (!match) return res.status(404).json({ message: 'Match record not found' });
      return res.json(match);
    } else {
      await memoryStore.init();
      const match = (memoryStore.matches || []).find((m) => m._id.toString() === id);
      if (!match) return res.status(404).json({ message: 'Match record not found' });
      return res.json(match);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all AI matches for current user's items
// @route   GET /api/matches/my-matches
// @access  Private
const getMyMatches = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const userItems = await Item.find({ user: req.user._id }).select('_id');
      const itemIds = userItems.map((i) => i._id);

      const matches = await AIMatch.find({
        $or: [{ lostItem: { $in: itemIds } }, { foundItem: { $in: itemIds } }],
        overallScore: { $gte: matchingConfig.thresholds.possibleMatch },
      })
        .populate({
          path: 'lostItem',
          populate: { path: 'user', select: 'name email department' },
        })
        .populate({
          path: 'foundItem',
          populate: { path: 'user', select: 'name email department' },
        })
        .sort({ overallScore: -1 });

      return res.json(matches);
    } else {
      await memoryStore.init();
      const matches = (memoryStore.matches || []).filter((m) => {
        const lostUserId = (m.lostItem.user._id || m.lostItem.user).toString();
        const foundUserId = (m.foundItem.user._id || m.foundItem.user).toString();
        return (
          (lostUserId === userId || foundUserId === userId) &&
          m.overallScore >= matchingConfig.thresholds.possibleMatch
        );
      });
      matches.sort((a, b) => b.overallScore - a.overallScore);
      return res.json(matches);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match status (confirm, reject, dismiss)
// @route   PATCH /api/matches/:id/status
// @access  Private
const updateMatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' | 'rejected' | 'dismissed'

    if (isDbConnected()) {
      const match = await AIMatch.findById(id);
      if (!match) return res.status(404).json({ message: 'Match not found' });

      match.status = status;
      await match.save();

      return res.json(match);
    } else {
      await memoryStore.init();
      const match = (memoryStore.matches || []).find((m) => m._id.toString() === id);
      if (!match) return res.status(404).json({ message: 'Match not found' });

      match.status = status;
      return res.json(match);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Trigger batch analysis across all active items
// @route   POST /api/matches/analyze
// @access  Private (Admin or Authenticated User)
const runBatchAnalysis = async (req, res) => {
  try {
    let lostItems = [];
    if (isDbConnected()) {
      lostItems = await Item.find({ type: 'lost', status: 'active' }).populate(
        'user',
        'name email department'
      );
    } else {
      await memoryStore.init();
      lostItems = (memoryStore.items || []).filter((i) => i.type === 'lost' && i.status === 'active');
    }

    let totalMatchesFound = 0;
    for (const lost of lostItems) {
      const matches = await analyzeItemMatches(lost);
      totalMatchesFound += matches.length;
    }

    return res.json({
      message: 'Batch AI matching analysis completed successfully',
      itemsScanned: lostItems.length,
      matchesGenerated: totalMatchesFound,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get configuration parameters
// @route   GET /api/matches/config
// @access  Public
const getMatchConfig = (req, res) => {
  res.json({
    weights: matchingConfig.weights,
    thresholds: matchingConfig.thresholds,
  });
};

module.exports = {
  analyzeItemMatches,
  getItemMatches,
  getMatchById,
  getMyMatches,
  updateMatchStatus,
  runBatchAnalysis,
  getMatchConfig,
};
