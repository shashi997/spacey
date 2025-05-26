// e:\placement\Spacey\project\v1\server\routes\learnRoutes.js
const express = require('express');
const router = express.Router();
const { handleLearnQuery } = require('../controllers/learnController');

// POST /api/learn/query (or just /api/learn if you prefer a single POST endpoint)
router.post('/query', handleLearnQuery); // Changed to /query for clarity, or use /

module.exports = router;
