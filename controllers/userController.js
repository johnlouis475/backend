const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Media = require('../models/Media');  // Import Media model
const calculateDistance = require('../utils/distance'); // Import distance function

// Register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user });
};

// Update profile picture
const updateProfilePic = async (req, res) => {
    const { userId } = req.body;
    const profilePicPath = req.file.path;

    try {
        await User.findByIdAndUpdate(userId, { profilePic: profilePicPath });
        res.json({ message: 'Profile picture updated successfully!', profilePicPath });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile picture' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    const { userId, name } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { name });
        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
};

// Update location
const updateLocation = async (req, res) => {
    const { userId, latitude, longitude } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { location: { latitude, longitude } });
        res.json({ message: 'Location updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating location' });
    }
};

// Calculate distance between two users
const calculateUserDistance = async (req, res) => {
    const { userId1, userId2 } = req.query;

    try {
        const user1 = await User.findById(userId1);
        const user2 = await User.findById(userId2);

        if (!user1 || !user2 || !user1.location || !user2.location) {
            return res.status(400).json({ error: 'User locations not found' });
        }

        const distance = calculateDistance(
            user1.location.latitude,
            user1.location.longitude,
            user2.location.latitude,
            user2.location.longitude
        );

        res.json({ distance });
    } catch (error) {
        res.status(500).json({ error: 'Error calculating distance' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateProfilePic,
    updateProfile,
    updateLocation,
    calculateUserDistance,
};
