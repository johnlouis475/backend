require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');  // Import routes
const fs = require('fs');
const path = require('path');
const multer = require('multer');  // Import multer
const Media = require('./models/Media'); // Import Media model

const app = express();
app.get("/", function (req, res){
    res.send("WORKING!!!");
})
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);  // Save files in the uploads directory
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);  // Get the file extension
        cb(null, Date.now() + fileExtension);  // Use timestamp as the filename to avoid collisions
    }
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

// Use routes
app.use('/api/users', userRoutes);  // Add route prefix

// Route to handle media file upload
app.post('/upload', upload.single('media'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaUrl = path.join('/uploads', req.file.filename);  // Store the URL of the uploaded file

    // Save file info in the database
    const media = new Media({
        path: mediaUrl,
        description: req.body.description || '',
        privacy: req.body.privacy || 'private'
    });

    try {
        await media.save();  // Save the media info in the database
        res.json({ message: 'File uploaded successfully', media: media });
    } catch (error) {
        res.status(500).json({ error: 'Error saving file info to database' });
    }
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
