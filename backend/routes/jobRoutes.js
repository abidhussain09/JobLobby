// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs
} = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to get all jobs (with search/filter)
router.get('/', getJobs);

// Route to get jobs posted by the authenticated recruiter (MORE SPECIFIC - MUST COME BEFORE /:id)
router.get('/my-jobs', protect, authorizeRoles('recruiter'), getMyJobs);

// Public route to get a single job by ID (LESS SPECIFIC - MUST COME AFTER /my-jobs)
router.get('/:id', getJobById);

// Protected routes for recruiters
router.route('/')
    .post(protect, authorizeRoles('recruiter'), createJob); // Only recruiters can create jobs

router.route('/:id')
    .put(protect, authorizeRoles('recruiter'), updateJob) // Only recruiters can update their jobs
    .delete(protect, authorizeRoles('recruiter'), deleteJob); // Only recruiters can delete their jobs


module.exports = router;
