const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '1h', 
    });
};


exports.registerUser = async (req, res) => {
    const { username, email, password, role, profile, company_details } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all required fields: username, email, password, and role.' });
    }

    try {
        let userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or username already exists.' });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password, // Password will be hashed by the pre-save hook in the User model
            role,
            profile: role === 'job_seeker' ? profile : {}, // Only assign profile if job_seeker
            company_details: role === 'recruiter' ? company_details : {} // Only assign company_details if recruiter
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                message: 'User registered successfully.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }

    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            message: 'Logged in successfully.'
        });

    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


exports.getUserProfile = async (req, res) => {
    // req.user is populated by the protect middleware
    try {
        const user = await User.findById(req.user._id).select('-password'); // Exclude password
        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                company_details: user.company_details
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};


exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            // Update password if provided
            if (req.body.password) {
                user.password = req.body.password; // Pre-save hook will hash this
            }

            // Update profile for job seekers
            if (user.role === 'job_seeker' && req.body.profile) {
                user.profile.name = req.body.profile.name || user.profile.name;
                user.profile.contact_number = req.body.profile.contact_number || user.profile.contact_number;
                user.profile.location = req.body.profile.location || user.profile.location;
                user.profile.resume_url = req.body.profile.resume_url || user.profile.resume_url;
                user.profile.skills = req.body.profile.skills || user.profile.skills;
                user.profile.experience = req.body.profile.experience || user.profile.experience;
                user.profile.education = req.body.profile.education || user.profile.education;
            }

            // Update company details for recruiters
            if (user.role === 'recruiter' && req.body.company_details) {
                user.company_details.company_name = req.body.company_details.company_name || user.company_details.company_name;
                user.company_details.description = req.body.company_details.description || user.company_details.description;
                user.company_details.website = req.body.company_details.website || user.company_details.website;
                user.company_details.logo_url = req.body.company_details.logo_url || user.company_details.logo_url;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profile: updatedUser.profile,
                company_details: updatedUser.company_details,
                token: generateToken(updatedUser._id), // Generate new token if user data changed
                message: 'Profile updated successfully.'
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};
