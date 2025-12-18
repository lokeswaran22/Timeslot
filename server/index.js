const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initDb } = require('./config/initDb');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const requestRoutes = require('./routes/requests');
const notificationRoutes = require('./routes/notifications');
const exportRoutes = require('./routes/export');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Schema
initDb();

// API Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', activityRoutes);
app.use('/api', requestRoutes);
app.use('/api', notificationRoutes);
app.use('/api', exportRoutes);

// Serve Static Files (React App)
// In production/Render, the React app is built to 'client/dist'
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Also serve images if they haven't been moved to client assets yet
// Check if retro-compatibility for /images URL is needed
app.use('/images', express.static(path.join(__dirname, '../images')));

// Catch-all handler for React SPA (must be last)
app.get(/.*/, (req, res) => {
    // If the client build exists, serve index.html
    // Otherwise, send a basic message or 404 (for dev mode without build)
    const indexPath = path.join(clientBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            if (process.env.NODE_ENV === 'production') {
                console.error('Error serving index.html:', err);
                res.status(500).send('Server Error');
            } else {
                res.send('API Server Running. Frontend build not found in client/dist. Run "npm run build" in client folder.');
            }
        }
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
