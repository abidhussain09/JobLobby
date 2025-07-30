const Job = require('../models/Job');
const User = require('../models/User'); 

exports.createJob = async (req, res) => {
    const { title, description, company_name, location, salary_range, requirements, responsibilities, job_type, experience_level, application_deadline } = req.body;

    if (!title || !description || !company_name || !location) {
        return res.status(400).json({ message: 'Please include title, description, company name, and location.' });
    }

    try {
        
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Not authorized. Only recruiters can create jobs.' });
        }

        const newJob = await Job.create({
            title,
            description,
            company_name,
            location,
            salary_range,
            requirements,
            responsibilities,
            job_type,
            experience_level,
            postedBy: req.user._id, 
            application_deadline
        });

        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error.message);
        res.status(500).json({ message: 'Server error creating job.' });
    }
};


exports.getJobs = async (req, res) => {
    try {
        const query = {};
        const { search, location, job_type, experience_level, minSalary, maxSalary } = req.query;

        // Search by keyword in title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
                { description: { $regex: search, $options: 'i' } },
                { company_name: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by job type
        if (job_type) {
            query.job_type = job_type;
        }

        // Filter by experience level
        if (experience_level) {
            query.experience_level = experience_level;
        }

        if (minSalary || maxSalary) {
            query.salary_range = { $exists: true }; // Ensure salary_range field exists
        }


        const jobs = await Job.find(query)
            .populate('postedBy', 'username email company_details.company_name') // Populate postedBy user details
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ message: 'Server error fetching jobs.' });
    }
};


exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'username email company_details.company_name');

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error('Error fetching job by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching job.' });
    }
};


exports.updateJob = async (req, res) => {
    const { title, description, company_name, location, salary_range, requirements, responsibilities, job_type, experience_level, application_deadline, status } = req.body;

    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the authenticated user is the one who posted the job
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this job.' });
        }

        // Update fields if provided
        job.title = title || job.title;
        job.description = description || job.description;
        job.company_name = company_name || job.company_name;
        job.location = location || job.location;
        job.salary_range = salary_range || job.salary_range;
        job.requirements = requirements || job.requirements;
        job.responsibilities = responsibilities || job.responsibilities;
        job.job_type = job_type || job.job_type;
        job.experience_level = experience_level || job.experience_level;
        job.application_deadline = application_deadline || job.application_deadline;
        job.status = status || job.status;

        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error.message);
        res.status(500).json({ message: 'Server error updating job.' });
    }
};


exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the authenticated user is the one who posted the job
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this job.' });
        }

        await Job.deleteOne({ _id: req.params.id }); 
        res.status(200).json({ message: 'Job removed successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error.message);
        res.status(500).json({ message: 'Server error deleting job.' });
    }
};


exports.getMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Not authorized. Only recruiters can view their posted jobs.' });
        }
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching recruiter\'s jobs:', error.message);
        res.status(500).json({ message: 'Server error fetching your jobs.' });
    }
};
