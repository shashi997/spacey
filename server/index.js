const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const quizRoutes = require('./routes/quiz'); // Import the quiz routes
const learnRoutes = require('./routes/learnRoutes');


const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Welcome to Spacey API v1");
})

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/learn', learnRoutes); 


// Start Server
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});