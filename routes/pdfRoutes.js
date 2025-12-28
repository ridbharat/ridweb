const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { z } = require('zod');

// Schema for book upload metadata
const bookUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description too short").max(1000, "Description too long"),
  category: z.enum(["technical", "non-technical", "fiction", "non-fiction", "educational", "other"]),
  tags: z.string().optional().transform(val => val ? val.split(',').map(t => t.trim()) : []),
  rating: z.string().optional().transform(val => val ? parseFloat(val) : 4.0),
});

// ==================== HEALTH & SECURITY ROUTES ====================
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Book Library API',
        security: 'Protected Mode Active',
        authentication: req.session.user ? 'Authenticated' : 'Public'
    });
});

// ==================== DASHBOARD & PAGE ROUTES ====================
router.get('/', pdfController.dashboard);
router.get('/upload', requireAuth, pdfController.uploadForm);
router.get('/edit/:id', requireAuth, pdfController.editForm);

// ==================== PDF OPERATION ROUTES ====================
// Upload
router.post('/upload', 
    requireAuth,
    upload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    handleUploadErrors,
    pdfController.uploadPDF
);

// Edit
router.post('/edit/:id',
    requireAuth,
    upload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    handleUploadErrors,
    pdfController.editPDF
);

// Delete
router.post('/delete/:id', requireAuth, pdfController.deletePDF);

// ==================== VIEW & DOWNLOAD ROUTES ====================
router.get('/viewer/:id', pdfController.viewPDF);
router.get('/download/:id', pdfController.downloadPDF);
router.get('/secure-viewer/:id', pdfController.secureViewPDF);

// ==================== API ROUTES ====================
router.get('/api/stats', pdfController.getStats);
router.get('/api/stream-pdf', pdfController.streamPDF);
router.get('/get-url/:filename', pdfController.getEbookUrl);

// ==================== SECURITY ROUTES ====================
router.post('/api/security/log', pdfController.logSecurityEvent);
router.get('/api/security/events', pdfController.getSecurityEvents);
router.post('/api/security/block-print', pdfController.blockPrintAttempt);
router.get('/api/security/health', pdfController.securityHealth);

module.exports = router;