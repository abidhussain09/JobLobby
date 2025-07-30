// src/pages/Jobs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/jobs'; // Your backend API URL for jobs

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setIsError(false); // Reset error state
        setMessage(''); // Reset message

        const response = await axios.get(API_URL);
        setJobs(response.data);
        setIsLoading(false);
        // isSuccess is implicit if no error
      } catch (error) {
        const errorMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        setIsError(true);
        setMessage(errorMessage);
        setIsLoading(false);
        console.error('Error fetching jobs:', errorMessage);
        alert(`Error fetching jobs: ${errorMessage}`); // Temporary alert for user
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on component mount

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading jobs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p className="text-xl font-semibold">Error: {message || 'Failed to load jobs.'}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Available Job Openings</h1>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-1"><strong>Company:</strong> {job.company_name}</p>
              <p className="text-gray-600 mb-1"><strong>Location:</strong> {job.location}</p>
              <p className="text-gray-600 mb-1"><strong>Type:</strong> {job.job_type}</p>
              <p className="text-gray-600 mb-4"><strong>Experience:</strong> {job.experience_level}</p>
              <Link
                to={`/jobs/${job._id}`}
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg">No job openings available at the moment.</p>
      )}
    </div>
  );
};

export default Jobs;
