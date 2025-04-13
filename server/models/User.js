const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        index: true,
        trim: true,
        minlength: 3
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        bio: { type: String, maxlength: 500 },
        avatar: { type: String },
        lastSeen: { type: Date }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String },
        lastPasswordChange: { type: Date },
        passwordHistory: [{ type: String }],
        securityQuestions: [{
            question: String,
            answer: String
        }]
    },
    preferences: {
        theme: { type: String, default: 'light' },
        notifications: {
            email: { type: Boolean, default: true },
            loginAlerts: { type: Boolean, default: true }
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastLogin: { 
        type: Date 
    },
    failedAttempts: { 
        type: Number, 
        default: 0 
    },
    lockedUntil: { 
        type: Date 
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
    },
    notifications: {
        email: {
            type: Boolean,
            default: false
        },
        loginAlerts: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ failedAttempts: 1, lockedUntil: 1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ username: 'text' });
userSchema.index({ 'profile.lastSeen': -1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Store password in history
        if (!this.security.passwordHistory) {
            this.security.passwordHistory = [];
        }
        this.security.passwordHistory.push(this.password);
        
        // Keep only last 5 passwords
        if (this.security.passwordHistory.length > 5) {
            this.security.passwordHistory.shift();
        }
        
        this.security.lastPasswordChange = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was used before
userSchema.methods.wasPasswordUsed = async function(password) {
    for (const oldPassword of this.security.passwordHistory) {
        if (await bcrypt.compare(password, oldPassword)) {
            return true;
        }
    }
    return false;
};

// Method to update last seen
userSchema.methods.updateLastSeen = async function() {
    this.profile.lastSeen = new Date();
    await this.save();
};

module.exports = mongoose.model('User', userSchema); 