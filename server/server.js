const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
// const path = require('path');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();
app.use(cors({
    origin: 'https://task-manager-three-pied.vercel.app/',
    credentials: true
}));

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static('client/dist'));

//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
//     });
// }

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: process.env.NODE_ENV === 'production' ? null : err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 