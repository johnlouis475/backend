const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');

const router = express.Router();

// Multer (File Upload) Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Register user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Upload profile picture
router.post('/upload-profile-pic', upload.single('profilePic'), userController.updateProfilePic);

// Upload media (new route)
router.post('/upload', upload.single('media'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaUrl = '/uploads/' + req.file.filename;

    // Save media data in the database
    const media = new Media({
        path: mediaUrl,
        description: req.body.description || '',
        privacy: req.body.privacy || 'private'
    });

    try {
        await media.save();
        res.json({ message: 'File uploaded successfully', media: media });
    } catch (error) {
        res.status(500).json({ error: 'Error saving file info to database' });
    }
});

// Update profile
router.put('/update-profile', userController.updateProfile);

// Update user location
router.put('/update-location', userController.updateLocation);

// Calculate distance between two users
router.get('/calculate-distance', userController.calculateUserDistance);

module.exports = router;
