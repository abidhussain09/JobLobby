// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reset, login } from '../features/auth/authSlice'; // Import login to update user in Redux

const API_URL = 'http://localhost:5000/api/auth/profile'; // Your backend API URL for profile

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '', // For changing password
        password2: '', // For password confirmation
        profile: {
            name: '',
            contact_number: '',
            location: '',
            resume_url: '',
            skills: '', // Comma-separated string
            experience: '',
            education: '',
        },
        company_details: {
            company_name: '',
            description: '',
            website: '',
            logo_url: '',
        },
    });

    const [isLoading, setIsLoading] = useState(true); // Initial loading for fetching profile
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading for form submission
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login'); // Redirect if not logged in
            return;
        }

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const response = await axios.get(API_URL, config);
                const userData = response.data;

                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    password: '', // Don't pre-fill password
                    password2: '',
                    profile: {
                        name: userData.profile?.name || '',
                        contact_number: userData.profile?.contact_number || '',
                        location: userData.profile?.location || '',
                        resume_url: userData.profile?.resume_url || '',
                        skills: userData.profile?.skills ? userData.profile.skills.join(', ') : '',
                        experience: userData.profile?.experience || '',
                        education: userData.profile?.education || '',
                    },
                    company_details: {
                        company_name: userData.company_details?.company_name || '',
                        description: userData.company_details?.description || '',
                        website: userData.company_details?.website || '',
                        logo_url: userData.company_details?.logo_url || '',
                    },
                });
                setIsLoading(false);
            } catch (err) {
                const errorMessage =
                    (err.response && err.response.data && err.response.data.message) ||
                    err.message ||
                    err.toString();
                setError(errorMessage);
                setIsLoading(false);
                console.error('Error fetching user profile:', errorMessage);
                alert(`Error loading profile: ${errorMessage}`);
                // Optionally redirect to login or dashboard on error
            }
        };

        fetchProfile();
    }, [user, navigate]); // Re-fetch if user object changes

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            setFormData((prevState) => ({
                ...prevState,
                profile: {
                    ...prevState.profile,
                    [name.split('.')[1]]: value,
                },
            }));
        } else if (name.startsWith('company_details.')) {
            setFormData((prevState) => ({
                ...prevState,
                company_details: {
                    ...prevState.company_details,
                    [name.split('.')[1]]: value,
                },
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        if (formData.password && formData.password !== formData.password2) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            };

            const dataToUpdate = {
                username: formData.username,
                email: formData.email,
            };

            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            if (user.role === 'job_seeker') {
                dataToUpdate.profile = {
                    ...formData.profile,
                    skills: formData.profile.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
                };
                // Remove empty strings from profile
                Object.keys(dataToUpdate.profile).forEach(key => {
                    if (dataToUpdate.profile[key] === '') {
                        delete dataToUpdate.profile[key];
                    }
                });
            } else if (user.role === 'recruiter') {
                dataToUpdate.company_details = { ...formData.company_details };
                // Remove empty strings from company_details
                Object.keys(dataToUpdate.company_details).forEach(key => {
                    if (dataToUpdate.company_details[key] === '') {
                        delete dataToUpdate.company_details[key];
                    }
                });
            }

            const response = await axios.put(API_URL, dataToUpdate, config);
            setSuccess(true);
            alert('Profile updated successfully!');
            console.log('Profile Updated:', response.data);

            // Update user in Redux state and localStorage with new token/data
            // The backend sends a new token if user data changes, so we re-login
            dispatch(login({ email: response.data.email, password: formData.password || 'dummy_password_if_not_changed' })); // This is a bit hacky, ideally backend sends full updated user object
            // A better approach is to dispatch an action that updates the Redux user state directly with response.data
            localStorage.setItem('user', JSON.stringify(response.data)); // Direct update as a fallback
            dispatch(reset()); // Reset auth slice state flags

        } catch (err) {
            const errorMessage =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(errorMessage);
            alert(`Error updating profile: ${errorMessage}`);
            console.error('Profile update error:', errorMessage);
        } finally {
            setIsSubmitting(false);
            setFormData(prev => ({ ...prev, password: '', password2: '' })); // Clear password fields
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-semibold">Loading profile...</p>
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
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Profile</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">Profile updated successfully!</div>}

            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            New Password (Optional)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={formData.password2}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                {user?.role === 'job_seeker' && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Seeker Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.name">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="profile.name"
                                    name="profile.name"
                                    value={formData.profile.name}
                                    onChange={onChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.contact_number">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    id="profile.contact_number"
                                    name="profile.contact_number"
                                    value={formData.profile.contact_number}
                                    onChange={onChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.location">
                                Location
                            </label>
                            <input
                                type="text"
                                id="profile.location"
                                name="profile.location"
                                value={formData.profile.location}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.resume_url">
                                Resume URL
                            </label>
                            <input
                                type="url"
                                id="profile.resume_url"
                                name="profile.resume_url"
                                value={formData.profile.resume_url}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Link to your online resume (e.g., Google Drive, Dropbox)"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.skills">
                                Skills (Comma-separated)
                            </label>
                            <textarea
                                id="profile.skills"
                                name="profile.skills"
                                value={formData.profile.skills}
                                onChange={onChange}
                                rows="2"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.experience">
                                Experience
                            </label>
                            <input
                                type="text"
                                id="profile.experience"
                                name="profile.experience"
                                value={formData.profile.experience}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., 5 years in Software Development"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile.education">
                                Education
                            </label>
                            <input
                                type="text"
                                id="profile.education"
                                name="profile.education"
                                value={formData.profile.education}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., Master's in Computer Science"
                            />
                        </div>
                    </div>
                )}

                {user?.role === 'recruiter' && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Details</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company_details.company_name">
                                Company Name
                            </label>
                            <input
                                type="text"
                                id="company_details.company_name"
                                name="company_details.company_name"
                                value={formData.company_details.company_name}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company_details.description">
                                Company Description
                            </label>
                            <textarea
                                id="company_details.description"
                                name="company_details.description"
                                value={formData.company_details.description}
                                onChange={onChange}
                                rows="4"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company_details.website">
                                Company Website
                            </label>
                            <input
                                type="url"
                                id="company_details.website"
                                name="company_details.website"
                                value={formData.company_details.website}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company_details.logo_url">
                                Company Logo URL
                            </label>
                            <input
                                type="url"
                                id="company_details.logo_url"
                                name="company_details.logo_url"
                                value={formData.company_details.logo_url}
                                onChange={onChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-6">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
