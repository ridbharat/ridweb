const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopcontroller.js');

// Apply for workshop/training certificate
router.post('/apply', workshopController.applyCertificate);

// Verify application status
router.get('/verify/:appId', workshopController.verifyApplication);

// Admin verify and generate PDF
router.get('/verify-admin/:appId', workshopController.adminVerify);

// Download certificate
router.get('/download/:appId', workshopController.downloadCertificate);

module.exports = router;