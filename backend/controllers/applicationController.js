const Application = require('../models/Application');
const Job = require('../models/Job'); 
const User = require('../models/User'); 

// Apply for a job
exports.applyForJob = async (req, res) => {
    const { jobId, cover_letter_text, resume_url } = req.body;

    // Basic validation
    if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required to apply.' });
    }

    try {
        // Ensure the authenticated user is a job seeker
        if (req.user.role !== 'job_seeker') {
            return res.status(403).json({ message: 'Not authorized. Only job seekers can apply for jobs.' });
        }

        // Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Check if the user has already applied for this job
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // Create new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: req.user._id,
            cover_letter_text,
            // If resume_url is not provided in body, try to use the one from user's profile
            resume_url: resume_url || req.user.profile.resume_url
        });

        res.status(201).json(newApplication);
    } catch (error) {
        console.error('Error applying for job:', error.message);
        res.status(500).json({ message: 'Server error applying for job.' });
    }
};

//Get all applications made by the authenticated job seeker

exports.getMyApplications = async (req, res) => {
    try {
        if (req.user.role !== 'job_seeker') {
            return res.status(403).json({ message: 'Not authorized. Only job seekers can view their applications.' });
        }

        const applications = await Application.find({ applicant: req.user._id })
            .populate('job', 'title company_name location') // Populate job details
            .sort({ appliedAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching job seeker applications:', error.message);
        res.status(500).json({ message: 'Server error fetching your applications.' });
    }
};

//  Get all applications for a specific job (for Recruiter)
exports.getApplicationsForJob = async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Not authorized. Only recruiters can view applications for their jobs.' });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the recruiter owns this job
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view applications for this job.' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'username email profile.name profile.contact_number profile.resume_url') // Populate applicant details
            .sort({ appliedAt: 1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications for job:', error.message);
        res.status(500).json({ message: 'Server error fetching applications for job.' });
    }
};

// Update application status (for Recruiter)
exports.updateApplicationStatus = async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Not authorized to update application status.' });
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Ensure the recruiter owns the job associated with this application
        if (application.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this application.' });
        }

        // Validate the new status against the enum in the schema
        const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted', 'withdrawn'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        application.status = status;
        const updatedApplication = await application.save();

        res.status(200).json(updatedApplication);
    } catch (error) {
        console.error('Error updating application status:', error.message);
        res.status(500).json({ message: 'Server error updating application status.' });
    }
};

//  Delete an application (Job Seeker can withdraw)
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Ensure the authenticated user is the one who made the application
        if (application.applicant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this application.' });
        }

        await Application.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Application removed successfully.' });
    } catch (error) {
        console.error('Error deleting application:', error.message);
        res.status(500).json({ message: 'Server error deleting application.' });
    }
};
