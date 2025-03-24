const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePic: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
