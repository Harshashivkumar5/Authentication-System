const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validation middleware
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
];

// Register route
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > Date.now()) {
            return res.status(401).json({ 
                error: 'Account is locked. Try again later.',
                lockedUntil: user.lockedUntil
            });
        }

        // Verify password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            // Increment failed attempts
            user.failedAttempts += 1;
            if (user.failedAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
            }
            await user.save();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed attempts and update last login
        user.failedAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check auth status
router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Get user settings
router.get('/settings', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            security: {
                twoFactorEnabled: user.twoFactorEnabled || false
            },
            preferences: {
                notifications: {
                    email: user.notifications?.email || false,
                    loginAlerts: user.notifications?.loginAlerts || false
                }
            }
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// Update user settings
router.put('/settings', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { notifications } = req.body;
        if (!notifications) {
            return res.status(400).json({ error: 'Invalid settings data' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.notifications = {
            ...user.notifications,
            ...notifications
        };

        await user.save();
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router; 