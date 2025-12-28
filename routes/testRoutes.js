const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Workshop API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test POST route
router.post('/test-post', (req, res) => {
  console.log("Test POST received:", req.body);
  res.json({
    success: true,
    message: 'POST request received successfully',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;