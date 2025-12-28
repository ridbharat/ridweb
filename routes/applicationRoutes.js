const express = require("express");
const router = express.Router();
const controller = require("../controllers/applicationController");

// Apply for certificate
router.post("/apply", controller.applyCertificate);

// User verification
router.get("/verify/:appId", controller.verifyById);

// Admin verification (from email link)
router.get("/verify-admin/:appId", controller.adminVerify);

// Download certificate
router.get("/download/:appId", controller.downloadCertificate);

module.exports = router;


