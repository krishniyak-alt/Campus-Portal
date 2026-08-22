const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('proofImage'), createClaim);
router.get('/my-claims', protect, getMyClaims);
router.get('/item/:itemId', protect, getItemClaims);
router.patch('/:id', protect, updateClaimStatus);

module.exports = router;
