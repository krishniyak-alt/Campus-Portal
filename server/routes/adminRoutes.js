const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getAllItems,
  deleteItemAdmin,
  deleteUserAdmin,
  getAllClaimsAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/items', getAllItems);
router.get('/claims', getAllClaimsAdmin);
router.delete('/items/:id', deleteItemAdmin);
router.delete('/users/:id', deleteUserAdmin);

module.exports = router;
