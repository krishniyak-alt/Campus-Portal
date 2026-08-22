const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'ai_match',
        'match_confirmed',
        'match_rejected',
        'chat_message',
        'claim_update',
        'claim_submitted',
        'claim_approved',
        'claim_rejected',
        'general',
      ],
      default: 'general',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    matchingItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIMatch',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    matchScore: {
      type: Number,
    },
    matchGrade: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
