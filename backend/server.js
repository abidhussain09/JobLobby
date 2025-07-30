const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();

const app = express();


app.use(express.json()); 
app.use(cors()); // Enable CORS for all origins (adjust in production)

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); 
    }
};

connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Define API routes
app.use('/api/auth', authRoutes); // For user authentication and profile
app.use('/api/jobs', jobRoutes); // For job postings
app.use('/api/applications', applicationRoutes); // For job applications

// Basic root route
app.get('/', (req, res) => {
    res.send('Job Portal API is running...');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
