const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    deleteApplication
} = require('../controllers/applicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('job_seeker'), applyForJob); 
router.get('/my-applications', protect, authorizeRoles('job_seeker'), getMyApplications); 
router.delete('/:id', protect, authorizeRoles('job_seeker'), deleteApplication); 

router.get('/job/:jobId', protect, authorizeRoles('recruiter'), getApplicationsForJob); 
router.put('/:id/status', protect, authorizeRoles('recruiter'), updateApplicationStatus); 

module.exports = router;
