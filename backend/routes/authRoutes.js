const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');
const upload = multer({ storage });

const router = express.Router();

// Auth Routes
router.post('/register', registerUser); // Register User
router.post('/login', loginUser); // Login User
router.get('/profile', protect, getUserProfile); //Get User Profile

router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = req.file.path;

  res.status(200).json({
    imageUrl,
  });
});

module.exports = router;
