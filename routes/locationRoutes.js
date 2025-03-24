const express = require('express');
const User = require('../models/User'); // Ensure your User model is properly set up
const calculateDistance = require('../utils/distance'); // Import distance function

const router = express.Router();

// API to calculate distance between two users
router.get('/calculate-distance', async (req, res) => {
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
});

module.exports = router;
