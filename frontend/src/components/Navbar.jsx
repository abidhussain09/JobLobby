// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">Job Portal</Link>
        <div>
          <Link to="/jobs" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition duration-200">Jobs</Link>

          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition duration-200">Dashboard</Link>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition duration-200">Login</Link>
              <Link to="/register" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition duration-200 ml-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
