const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: Number, enum: [undefined], required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (organisationSchema.path('email')) organisationSchema.index({ email: 1 });
if (organisationSchema.path('status')) organisationSchema.index({ status: 1 });
if (organisationSchema.path('createdAt')) organisationSchema.index({ createdAt: -1 });
if (organisationSchema.path('role')) organisationSchema.index({ role: 1 });
if (organisationSchema.path('category')) organisationSchema.index({ category: 1 });

module.exports = mongoose.model('Organisation', organisationSchema);
