const express = require('express');
const router = express.Router();
const {
  getConversations,
  startOrGetConversation,
  getMessages,
  sendMessage,
  toggleBlockUser,
  reportUser,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, startOrGetConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);
router.post('/conversations/:id/block', protect, toggleBlockUser);
router.post('/conversations/:id/report', protect, reportUser);

module.exports = router;
