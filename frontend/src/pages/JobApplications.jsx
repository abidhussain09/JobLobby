// src/pages/JobApplications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/applications'; // Your backend API URL for applications

const JobApplications = () => {
    const { jobId } = useParams(); // Get job ID from URL
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobTitle, setJobTitle] = useState(''); // To display the job title

    const applicationStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted', 'withdrawn'];

    useEffect(() => {
        if (!user || user.role !== 'recruiter') {
            navigate('/dashboard');
            alert('You must be a recruiter to view job applications.');
            return;
        }

        const fetchApplications = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const response = await axios.get(`${API_URL}/job/${jobId}`, config);
                setApplications(response.data);
                // Assuming the first application's job object has the title, or fetch job details separately
                if (response.data.length > 0 && response.data[0].job) {
                    setJobTitle(response.data[0].job.title);
                } else {
                    // Fallback to fetch job title if no applications or job not populated
                    try {
                        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
                        setJobTitle(jobResponse.data.title);
                    } catch (jobErr) {
                        console.error('Could not fetch job title:', jobErr);
                        setJobTitle('Job Title Not Found');
                    }
                }
                setIsLoading(false);
            } catch (err) {
                const errorMessage =
                    (err.response && err.response.data && err.response.data.message) ||
                    err.message ||
                    err.toString();
                setError(errorMessage);
                setIsLoading(false);
                console.error('Error fetching applications:', errorMessage);
                alert(`Error loading applications: ${errorMessage}`);
                navigate('/dashboard'); // Redirect if job not found or not authorized
            }
        };

        if (jobId) {
            fetchApplications();
        }
    }, [jobId, user, navigate]);

    const handleStatusChange = async (applicationId, newStatus) => {
        if (!user || user.role !== 'recruiter') {
            alert('Not authorized to update status.');
            return;
        }
        if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await axios.put(`${API_URL}/${applicationId}/status`, { status: newStatus }, config);

            // Update the application in the local state
            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app._id === applicationId ? response.data : app
                )
            );
            alert('Application status updated successfully!');
        } catch (err) {
            const errorMessage =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(errorMessage);
            alert(`Error updating status: ${errorMessage}`);
            console.error('Status update error:', errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-semibold">Loading applications...</p>
            </div>
        );
    }

    if (error && !isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-red-600">
                <p className="text-xl font-semibold">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Applications for: {jobTitle || 'Loading Job...'}
            </h1>
            <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
                &larr; Back to Dashboard
            </Link>

            {applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2">
                                Applicant: {app.applicant?.profile?.name || app.applicant?.username || 'N/A'}
                            </h2>
                            <p className="text-gray-600 mb-1">Email: {app.applicant?.email || 'N/A'}</p>
                            {app.applicant?.profile?.contact_number && (
                                <p className="text-gray-600 mb-1">Contact: {app.applicant.profile.contact_number}</p>
                            )}
                            <p className="text-gray-600 mb-1">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                            <p className="text-gray-600 mb-2">
                                Current Status: <span className={`font-semibold ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {app.status}
                                </span>
                            </p>
                            {app.cover_letter_text && (
                                <p className="text-gray-600 text-sm italic mb-2">
                                    "{(app.cover_letter_text.length > 100 ? app.cover_letter_text.substring(0, 97) + '...' : app.cover_letter_text)}"
                                </p>
                            )}
                            {app.applicant?.profile?.resume_url && (
                                <a
                                    href={app.applicant.profile.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm block mb-2"
                                >
                                    View Applicant's Resume
                                </a>
                            )}
                            {app.resume_url && app.resume_url !== app.applicant?.profile?.resume_url && (
                                <a
                                    href={app.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm block mb-2"
                                >
                                    View Application-Specific Resume
                                </a>
                            )}

                            <div className="mt-3">
                                <label htmlFor={`status-${app._id}`} className="block text-gray-700 text-sm font-bold mb-1">
                                    Update Status:
                                </label>
                                <select
                                    id={`status-${app._id}`}
                                    value={app.status}
                                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {applicationStatuses.map((statusOption) => (
                                        <option key={statusOption} value={statusOption}>
                                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 text-lg mt-8">No applications received for this job yet.</p>
            )}
        </div>
    );
};

export default JobApplications;
