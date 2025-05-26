// server/routes/quiz.js
const express = require('express');
const router = express.Router();
const { submitQuizAndGetFeedback } = require('../controllers/quizController');

// POST /api/quiz
router.post('/', submitQuizAndGetFeedback);

module.exports = router;
