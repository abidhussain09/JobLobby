// src/pages/EditJob.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/jobs'; // Your backend API URL for jobs

const EditJob = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get job ID from URL
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company_name: '',
        location: '',
        salary_range: '',
        requirements: '',
        responsibilities: '',
        job_type: 'Full-time',
        experience_level: 'Entry-level',
        application_deadline: '',
        status: 'active',
    });

    const [isLoading, setIsLoading] = useState(true); // Initial loading for fetching job
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading for form submission
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'recruiter') {
            navigate('/dashboard');
            alert('You must be a recruiter to edit jobs.');
            return;
        }

        const fetchJob = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const response = await axios.get(`${API_URL}/${id}`, config);
                const jobData = response.data;

                // Pre-fill form with existing job data
                setFormData({
                    title: jobData.title || '',
                    description: jobData.description || '',
                    company_name: jobData.company_name || '',
                    location: jobData.location || '',
                    salary_range: jobData.salary_range || '',
                    requirements: jobData.requirements ? jobData.requirements.join(', ') : '',
                    responsibilities: jobData.responsibilities ? jobData.responsibilities.join(', ') : '',
                    job_type: jobData.job_type || 'Full-time',
                    experience_level: jobData.experience_level || 'Entry-level',
                    // Format date for input type="date"
                    application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : '',
                    status: jobData.status || 'active',
                });
                setIsLoading(false);
            } catch (err) {
                const errorMessage =
                    (err.response && err.response.data && err.response.data.message) ||
                    err.message ||
                    err.toString();
                setError(errorMessage);
                setIsLoading(false);
                console.error('Error fetching job for edit:', errorMessage);
                alert(`Error loading job for edit: ${errorMessage}`);
                navigate('/dashboard'); // Redirect if job not found or not authorized
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id, user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            };

            // Convert comma-separated strings to arrays
            const jobDataToUpdate = {
                ...formData,
                requirements: formData.requirements.split(',').map(item => item.trim()).filter(item => item !== ''),
                responsibilities: formData.responsibilities.split(',').map(item => item.trim()).filter(item => item !== ''),
            };

            // Remove empty strings for optional fields if not provided
            Object.keys(jobDataToUpdate).forEach(key => {
                if (jobDataToUpdate[key] === '') {
                    delete jobDataToUpdate[key];
                }
            });

            const response = await axios.put(`${API_URL}/${id}`, jobDataToUpdate, config);
            setSuccess(true);
            alert('Job updated successfully!');
            console.log('Job Updated:', response.data);
            navigate('/dashboard'); // Redirect to dashboard or my-jobs
        } catch (err) {
            const errorMessage =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(errorMessage);
            alert(`Error updating job: ${errorMessage}`);
            console.error('Job update error:', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-semibold">Loading job details for edit...</p>
            </div>
        );
    }

    if (error && !isLoading) { // Show error only if not loading initial data
        return (
            <div className="flex justify-center items-center h-screen text-red-600">
                <p className="text-xl font-semibold">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Job Posting</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">Job updated successfully!</div>}

            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Job Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., Software Engineer"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company_name">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., Tech Solutions Inc."
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Job Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        rows="6"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Provide a detailed description of the job role, responsibilities, and company culture."
                        required
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., New York, NY"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary_range">
                            Salary Range (e.g., 50k-70k, Negotiable)
                        </label>
                        <input
                            type="text"
                            id="salary_range"
                            name="salary_range"
                            value={formData.salary_range}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., $50,000 - $70,000"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
                        Requirements (Comma-separated)
                    </label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={onChange}
                        rows="3"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., 3+ years experience, JavaScript, React, Node.js"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="responsibilities">
                        Responsibilities (Comma-separated)
                    </label>
                    <textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={onChange}
                        rows="3"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., Develop new features, Collaborate with team, Write clean code"
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="job_type">
                            Job Type
                        </label>
                        <select
                            id="job_type"
                            name="job_type"
                            value={formData.job_type}
                            onChange={onChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Temporary">Temporary</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience_level">
                            Experience Level
                        </label>
                        <select
                            id="experience_level"
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={onChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="Entry-level">Entry-level</option>
                            <option value="Mid-level">Mid-level</option>
                            <option value="Senior">Senior</option>
                            <option value="Director">Director</option>
                            <option value="Executive">Executive</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="application_deadline">
                            Application Deadline (Optional)
                        </label>
                        <input
                            type="date"
                            id="application_deadline"
                            name="application_deadline"
                            value={formData.application_deadline}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Job Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={onChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditJob;
