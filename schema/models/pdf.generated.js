const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filename: { type: String, required: true },
  originalFilename: { type: String, required: true, default: "unknown.pdf" },
  coverImage: { type: String },
  rating: { type: Number, required: true, default: 4 },
  category: { type: String, enum: ["technical","non-technical","other"], required: true, default: "technical" },
  tags: { type: Array },
  fileSize: { type: Number, required: true, default: 0 },
  viewCount: { type: Number, required: true, default: 0 },
  downloadCount: { type: Number, required: true, default: 0 },
  uploadDate: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (pdfSchema.path('email')) pdfSchema.index({ email: 1 });
if (pdfSchema.path('status')) pdfSchema.index({ status: 1 });
if (pdfSchema.path('createdAt')) pdfSchema.index({ createdAt: -1 });
if (pdfSchema.path('role')) pdfSchema.index({ role: 1 });
if (pdfSchema.path('category')) pdfSchema.index({ category: 1 });

module.exports = mongoose.model('Pdf', pdfSchema);
