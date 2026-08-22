const mongoose = require('mongoose');
const Item = require('../models/Item');
const memoryStore = require('../services/store');
const { handleImageUpload } = require('../middleware/uploadMiddleware');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all items with search, filter, and pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { type, category, search, status, sort, page = 1, limit = 12 } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (type) query.type = type;
      if (category && category !== 'All') query.category = category;
      if (status && status !== 'All') query.status = status;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'oldest') sortOptions = { createdAt: 1 };
      if (sort === 'updated') sortOptions = { updatedAt: -1 };

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Item.countDocuments(query);

      const items = await Item.find(query)
        .populate('user', 'name email department studentId')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        items,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        total,
      });
    } else {
      // Memory fallback
      await memoryStore.init();
      let list = [...memoryStore.items];

      if (type) list = list.filter((i) => i.type === type);
      if (category && category !== 'All') list = list.filter((i) => i.category === category);
      if (status && status !== 'All') list = list.filter((i) => i.status === status);

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (i) =>
            i.title.toLowerCase().includes(s) ||
            i.description.toLowerCase().includes(s) ||
            i.location.toLowerCase().includes(s)
        );
      }

      if (sort === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const total = list.length;
      const skip = (Number(page) - 1) * Number(limit);
      const items = list.slice(skip, skip + Number(limit));

      return res.json({
        items,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        total,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id).populate(
        'user',
        'name email department studentId'
      );
      if (item) return res.json(item);
    } else {
      await memoryStore.init();
      const item = memoryStore.items.find((i) => i._id.toString() === req.params.id.toString());
      if (item) return res.json(item);
    }
    return res.status(404).json({ message: 'Item not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new item (Lost or Found)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      description,
      location,
      currentLocation,
      date,
      time,
      contactPreference,
    } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req.file, req);
    }

    if (isDbConnected()) {
      const item = new Item({
        title,
        type,
        category,
        description,
        location,
        currentLocation: currentLocation || '',
        date: date || Date.now(),
        time: time || '',
        image: imageUrl,
        contactPreference: contactPreference || 'portal',
        user: req.user._id,
      });

      const createdItem = await item.save();
      const populatedItem = await Item.findById(createdItem._id).populate(
        'user',
        'name email department studentId'
      );

      return res.status(201).json(populatedItem);
    } else {
      await memoryStore.init();
      const newItem = {
        _id: 'itm_' + Date.now(),
        title,
        type,
        category,
        description,
        location,
        currentLocation: currentLocation || '',
        date: date || new Date(),
        time: time || '',
        image: imageUrl,
        contactPreference: contactPreference || 'portal',
        status: 'active',
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          studentId: req.user.studentId,
          department: req.user.department,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.items.unshift(newItem);
      return res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
const updateItem = async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this report' });
      }

      const {
        title,
        category,
        description,
        location,
        currentLocation,
        date,
        time,
        contactPreference,
        status,
      } = req.body;

      if (title) item.title = title;
      if (category) item.category = category;
      if (description) item.description = description;
      if (location) item.location = location;
      if (currentLocation !== undefined) item.currentLocation = currentLocation;
      if (date) item.date = date;
      if (time !== undefined) item.time = time;
      if (contactPreference) item.contactPreference = contactPreference;
      if (status) item.status = status;

      if (req.file) {
        item.image = await handleImageUpload(req.file, req);
      }

      const updatedItem = await item.save();
      const populatedItem = await Item.findById(updatedItem._id).populate(
        'user',
        'name email department studentId'
      );

      return res.json(populatedItem);
    } else {
      await memoryStore.init();
      const item = memoryStore.items.find((i) => i._id.toString() === req.params.id.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });

      if (item.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this report' });
      }

      Object.assign(item, req.body);
      item.updatedAt = new Date();
      return res.json(item);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
const deleteItem = async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this report' });
      }

      await item.deleteOne();
      return res.json({ message: 'Item report deleted successfully' });
    } else {
      await memoryStore.init();
      const index = memoryStore.items.findIndex((i) => i._id.toString() === req.params.id.toString());
      if (index === -1) return res.status(404).json({ message: 'Item not found' });

      const item = memoryStore.items[index];
      if (item.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this report' });
      }

      memoryStore.items.splice(index, 1);
      return res.json({ message: 'Item report deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item status (active, claimed, resolved)
// @route   PATCH /api/items/:id/status
// @access  Private (Owner or Admin)
const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update status' });
      }

      item.status = status;
      await item.save();

      return res.json(item);
    } else {
      await memoryStore.init();
      const item = memoryStore.items.find((i) => i._id.toString() === req.params.id.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });

      if (item.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update status' });
      }

      item.status = status;
      item.updatedAt = new Date();
      return res.json(item);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's own item reports
// @route   GET /api/items/my-reports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    if (isDbConnected()) {
      const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(items);
    } else {
      await memoryStore.init();
      const items = memoryStore.items.filter(
        (i) => i.user._id.toString() === req.user._id.toString()
      );
      return res.json(items);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
  getMyReports,
};
