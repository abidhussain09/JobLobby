// src/pages/JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux'; // To check if user is logged in for apply button

const API_URL = 'http://localhost:5000/api/jobs'; // Your backend API URL for jobs

const JobDetails = () => {
  const { id } = useParams(); // Get job ID from URL
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false); // State for apply modal
  const [coverLetter, setCoverLetter] = useState('');

  const { user } = useSelector((state) => state.auth); // Get user from Redux state

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setMessage('');
        setJob(null); // Clear previous job details

        const response = await axios.get(`${API_URL}/${id}`);
        setJob(response.data);
        setIsLoading(false);
      } catch (error) {
        const errorMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        setIsError(true);
        setMessage(errorMessage);
        setIsLoading(false);
        console.error('Error fetching job details:', errorMessage);
        alert(`Error fetching job details: ${errorMessage}`);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]); // Re-run effect if ID changes

  const handleApply = async () => {
    if (!user) {
      alert('Please log in to apply for jobs.');
      return;
    }
    if (user.role !== 'job_seeker') {
      alert('Only job seekers can apply for jobs.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const applicationData = {
        jobId: job._id,
        cover_letter_text: coverLetter,
        // Optionally send resume_url from user profile if not provided in form
        resume_url: user.profile?.resume_url || ''
      };

      const response = await axios.post('http://localhost:5000/api/applications', applicationData, config);
      alert('Application submitted successfully!');
      setShowApplyModal(false); // Close modal
      setCoverLetter(''); // Clear cover letter
      console.log('Application response:', response.data);
    } catch (error) {
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      alert(`Error submitting application: ${errorMessage}`);
      console.error('Application submission error:', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading job details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p className="text-xl font-semibold">Error: {message || 'Failed to load job details.'}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <p className="text-xl font-semibold">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">{job.title}</h1>
        <p className="text-gray-700 text-lg mb-2"><strong>Company:</strong> {job.company_name}</p>
        <p className="text-gray-700 mb-2"><strong>Location:</strong> {job.location}</p>
        <p className="text-gray-700 mb-2"><strong>Salary:</strong> {job.salary_range || 'Not specified'}</p>
        <p className="text-gray-700 mb-2"><strong>Job Type:</strong> {job.job_type}</p>
        <p className="text-gray-700 mb-4"><strong>Experience Level:</strong> {job.experience_level}</p>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">Description:</h3>
        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{job.description}</p>

        {job.requirements && job.requirements.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Requirements:</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </>
        )}

        {job.responsibilities && job.responsibilities.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Responsibilities:</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              {job.responsibilities.map((res, index) => (
                <li key={index}>{res}</li>
              ))}
            </ul>
          </>
        )}

        {job.application_deadline && (
          <p className="text-gray-700 mb-4">
            <strong>Application Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}
          </p>
        )}

        {user && user.role === 'job_seeker' && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 mt-4"
          >
            Apply Now
          </button>
        )}

        {!user && (
          <p className="text-gray-600 mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to apply for this job.
          </p>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>
              <div className="mb-4">
                <label htmlFor="coverLetter" className="block text-gray-700 text-sm font-bold mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Write your cover letter here..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
