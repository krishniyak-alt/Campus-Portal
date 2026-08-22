const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title/Item Name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Type (lost/found) is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'ID Card',
        'Electronics',
        'Water Bottle',
        'Notebook',
        'Bag',
        'Keys',
        'Accessories',
        'Clothing',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    model: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    currentLocation: {
      type: String,
      default: '', // For found items: e.g. "Security Desk Main Gate", "Library Reception"
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    contactPreference: {
      type: String,
      enum: ['email', 'phone', 'portal'],
      default: 'portal',
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
