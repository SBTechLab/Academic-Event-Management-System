const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Academic Event Management System API is running...');
});

// Error Handling/404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
