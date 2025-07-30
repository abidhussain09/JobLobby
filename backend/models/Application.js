const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', 
        required: true
    },
    
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'interview', 'rejected', 'accepted', 'withdrawn'],
        default: 'pending'
    },
    cover_letter_text: {
        type: String,
        trim: true,
        default: '' 
    },
    resume_url: {
        type: String, 
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` field on save
ApplicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;