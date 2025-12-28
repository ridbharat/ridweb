const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  publishYear: { type: Number },
  category: { type: String, enum: ["technical","non-technical","fiction","non-fiction","educational","other"], required: true, default: "other" },
  tags: { type: Array },
  rating: { type: Number, required: true, default: 4 },
  language: { type: String, required: true, default: "English" },
  isbn: { type: String },
  pages: { type: Number },
  coverImage: { type: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
  } },
  pdfFile: { type: {
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
  } },
  viewCount: { type: Number, required: true, default: 0 },
  downloadCount: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, required: true, default: true },
  isFeatured: { type: Boolean, required: true, default: false },
  uploadedBy: { type: String, required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (booksSchema.path('email')) booksSchema.index({ email: 1 });
if (booksSchema.path('status')) booksSchema.index({ status: 1 });
if (booksSchema.path('createdAt')) booksSchema.index({ createdAt: -1 });
if (booksSchema.path('role')) booksSchema.index({ role: 1 });
if (booksSchema.path('category')) booksSchema.index({ category: 1 });

module.exports = mongoose.model('Books', booksSchema);
