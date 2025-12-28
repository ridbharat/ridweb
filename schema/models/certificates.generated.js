const mongoose = require('mongoose');

const certificatesSchema = new mongoose.Schema({
  certificateId: { type: String, required: true },
  applicationId: { type: String, required: true },
  internName: { type: String, required: true },
  issueDate: { type: String, required: true },
  description: { type: String, required: true },
  certificateFile: { type: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
  }, required: true },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (certificatesSchema.path('email')) certificatesSchema.index({ email: 1 });
if (certificatesSchema.path('status')) certificatesSchema.index({ status: 1 });
if (certificatesSchema.path('createdAt')) certificatesSchema.index({ createdAt: -1 });
if (certificatesSchema.path('role')) certificatesSchema.index({ role: 1 });
if (certificatesSchema.path('category')) certificatesSchema.index({ category: 1 });

module.exports = mongoose.model('Certificates', certificatesSchema);
