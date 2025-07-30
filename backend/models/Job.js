const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    company_name: {
        type: String,
        required: true, 
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    salary_range: {
        type: String, 
        trim: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    responsibilities: [{
        type: String,
        trim: true
    }],
    job_type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
        default: 'Full-time'
    },
    experience_level: {
        type: String,
        enum: ['Entry-level', 'Mid-level', 'Senior', 'Director', 'Executive'],
        default: 'Entry-level'
    },
    
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    application_deadline: {
        type: Date,
        required: false // Optional deadline
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
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

// Update `updatedAt` field on save
JobSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;