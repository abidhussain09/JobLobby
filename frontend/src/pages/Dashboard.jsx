// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api'; // Base URL for your backend API

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [myApplications, setMyApplications] = useState([]);
  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      // Should be handled by PrivateRoute, but good to have a fallback
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        if (user.role === 'job_seeker') {
          // Fetch job seeker's applications
          const applicationsResponse = await axios.get(`${API_BASE_URL}/applications/my-applications`, config);
          setMyApplications(applicationsResponse.data);
        } else if (user.role === 'recruiter') {
          // Fetch recruiter's posted jobs
          const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/my-jobs`, config);
          setMyPostedJobs(jobsResponse.data);
        }
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          err.toString();
        setError(errorMessage);
        setIsLoading(false);
        console.error('Error fetching dashboard data:', errorMessage);
        alert(`Error loading dashboard: ${errorMessage}`);
      }
    };

    fetchDashboardData();
  }, [user]); // Re-run when user changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p className="text-xl font-semibold">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <p className="text-xl font-semibold">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Welcome, {user.username}! ({user.role.replace('_', ' ').toUpperCase()})
      </h1>

      {user.role === 'job_seeker' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">My Applications</h2>
          {myApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myApplications.map((app) => (
                <div key={app._id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800">{app.job?.title || 'Job Title Not Available'}</h3>
                  <p className="text-gray-600">Company: {app.job?.company_name || 'N/A'}</p>
                  <p className="text-gray-600">Status: <span className={`font-semibold ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{app.status}</span></p>
                  <p className="text-gray-600 text-sm">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                  <Link to={`/jobs/${app.job?._id}`} className="text-blue-500 hover:underline text-sm mt-2 block">
                    View Job
                  </Link>
                  {/* Add withdraw/delete application button later */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You haven't applied for any jobs yet. <Link to="/jobs" className="text-blue-600 hover:underline">Browse jobs</Link>.</p>
          )}
        </div>
      )}

      {user.role === 'recruiter' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">My Posted Jobs</h2>
          <Link
            to="/post-job" // We'll create this route and component next
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 mb-4 inline-block"
          >
            Post New Job
          </Link>
          {myPostedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {myPostedJobs.map((job) => (
                <div key={job._id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                  <p className="text-gray-600">Location: {job.location}</p>
                  <p className="text-gray-600">Status: <span className={`font-semibold ${job.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{job.status}</span></p>
                  <p className="text-gray-600 text-sm">Posted on: {new Date(job.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 flex space-x-2">
                    <Link to={`/jobs/${job._id}`} className="text-blue-500 hover:underline text-sm">
                      View Job
                    </Link>
                    <Link to={`/edit-job/${job._id}`} className="text-yellow-500 hover:underline text-sm">
                      Edit
                    </Link>
                    <Link to={`/job-applications/${job._id}`} className="text-purple-500 hover:underline text-sm">
                      View Applications
                    </Link>
                    {/* Add delete job button later */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You haven't posted any jobs yet.</p>
          )}
        </div>
      )}

      {/* Optional: Admin Panel section if user.role === 'admin' */}
      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-red-700 mb-4">Admin Panel</h2>
          <p className="text-gray-600">Admin specific functionalities will go here.</p>
          {/* E.g., User management, overall job/application oversight */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
