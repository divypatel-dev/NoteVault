const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for profile picture
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Get user profile (using findOne since this is a personal app with a single user for now)
router.get('/', async (req, res) => {
    try {
        let user = await User.findOne();
        if (!user) {
            user = new User();
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update user profile
router.put('/', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, email, phone, removePhoto } = req.body;
        console.log('--- Profile Update Request ---');
        console.log('Body:', { name, email, phone, removePhoto });
        console.log('File:', req.file?.filename);

        let user = await User.findOne();
        if (!user) user = new User();

        // Update basic fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;

        // Image handling
        const oldPicture = user.profilePicture;

        if (removePhoto === 'true') {
            user.profilePicture = null;
            if (oldPicture) {
                const oldPath = path.join(__dirname, '../uploads', oldPicture);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        } else if (req.file) {
            user.profilePicture = req.file.filename;
            if (oldPicture) {
                const oldPath = path.join(__dirname, '../uploads', oldPicture);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const savedUser = await user.save();
        console.log('Successfully saved user:', savedUser);
        res.json(savedUser);
    } catch (err) {
        console.error('Profile update failed:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

module.exports = router;
