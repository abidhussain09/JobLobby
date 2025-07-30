// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import JobApplications from './pages/JobApplications';
import UserProfile from './pages/UserProfile'; // Import the new UserProfile component

function App() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/post-job" element={<PrivateRoute role="recruiter"><PostJob /></PrivateRoute>} />
          <Route path="/edit-job/:id" element={<PrivateRoute role="recruiter"><EditJob /></PrivateRoute>} />
          <Route path="/job-applications/:jobId" element={<PrivateRoute role="recruiter"><JobApplications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} /> {/* New route for user profile */}

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
