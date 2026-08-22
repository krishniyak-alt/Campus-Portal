const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../services/store');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_lost_found_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, studentId, department, phone, password } = req.body;

    if (!name || !email || !studentId || !department || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields including contact number' });
    }

    if (!email.toLowerCase().includes('@ksrce')) {
      return res.status(400).json({ message: 'Email must be a valid @ksrce email address (e.g. student@ksrce.ac.in)' });
    }

    if (isDbConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        studentId,
        department,
        phone,
        password: hashedPassword,
        role: 'student',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // Memory Fallback
      await memoryStore.init();
      const userExists = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email: email.toLowerCase(),
        studentId,
        department,
        phone,
        password: hashedPassword,
        role: 'student',
        createdAt: new Date(),
      };

      memoryStore.users.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        studentId: newUser.studentId,
        department: newUser.department,
        phone: newUser.phone,
        role: newUser.role,
        token: generateToken(newUser._id),
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (!email.toLowerCase().includes('@ksrce')) {
      return res.status(400).json({ message: 'Email must be a valid @ksrce email address (e.g. student@ksrce.ac.in)' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await bcrypt.compare(password, user.password))) {
        // If phone is provided, optional check or update if missing
        if (phone && !user.phone) {
          user.phone = phone;
          await user.save();
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone || phone || '',
          role: user.role,
          token: generateToken(user._id),
        });
      }
    } else {
      // Memory Fallback
      await memoryStore.init();
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user && (await bcrypt.compare(password, user.password))) {
        if (phone && !user.phone) {
          user.phone = phone;
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone || phone || '',
          role: user.role,
          token: generateToken(user._id),
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id).select('-password');
      return res.json(user);
    } else {
      await memoryStore.init();
      const user = memoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
