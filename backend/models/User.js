const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6 
    },
    role: {
        type: String,
        enum: ['job_seeker', 'recruiter', 'admin'],
        default: 'job_seeker', 
        required: true
    },
    profile: {
        name: { type: String, trim: true },
        contact_number: { type: String, trim: true },
        location: { type: String, trim: true },
        resume_url: { type: String }, // URL to uploaded resume
        skills: [{ type: String, trim: true }],
        experience: { type: String, trim: true }, // e.g., "2 years", "Entry-level"
        education: { type: String, trim: true }
    },
    company_details: {
        company_name: { type: String, trim: true },
        description: { type: String, trim: true },
        website: { type: String, trim: true },
        logo_url: { type: String } 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update `updatedAt` field on save
UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;