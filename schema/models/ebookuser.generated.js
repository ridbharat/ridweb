const mongoose = require('mongoose');

const ebookuserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin","user"], required: true, default: "admin" },
  lastLogin: { type: String },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (ebookuserSchema.path('email')) ebookuserSchema.index({ email: 1 });
if (ebookuserSchema.path('status')) ebookuserSchema.index({ status: 1 });
if (ebookuserSchema.path('createdAt')) ebookuserSchema.index({ createdAt: -1 });
if (ebookuserSchema.path('role')) ebookuserSchema.index({ role: 1 });
if (ebookuserSchema.path('category')) ebookuserSchema.index({ category: 1 });

module.exports = mongoose.model('Ebookuser', ebookuserSchema);
