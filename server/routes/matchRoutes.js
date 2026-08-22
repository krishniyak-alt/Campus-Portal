const express = require('express');
const router = express.Router();
const {
  getItemMatches,
  getMatchById,
  getMyMatches,
  updateMatchStatus,
  runBatchAnalysis,
  getMatchConfig,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', getMatchConfig);
router.get('/my-matches', protect, getMyMatches);
router.get('/item/:itemId', getItemMatches);
router.get('/:id', getMatchById);
router.patch('/:id/status', protect, updateMatchStatus);
router.post('/analyze', protect, runBatchAnalysis);

module.exports = router;
