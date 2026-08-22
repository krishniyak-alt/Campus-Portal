const mongoose = require('mongoose');

const aiMatchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchGrade: {
      type: String,
      enum: ['High Match', 'Possible Match', 'No Strong Match'],
      required: true,
    },
    summaryExplanation: {
      type: String,
      default: '',
    },
    factors: {
      category: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      nameDescription: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      brandModel: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      color: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      location: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      dateTime: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
      imageSimilarity: {
        score: Number,
        weight: Number,
        matched: Boolean,
        detail: String,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIMatch', aiMatchSchema);
