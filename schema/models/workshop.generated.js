const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  appId: { type: String, required: true },
  fullName: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: String, required: true },
  certificateType: { type: String, enum: ["workshop","training"], required: true },
  duration: { type: Number, required: true },
  durationUnit: { type: String, enum: ["hours","weeks","months"], required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["PENDING","VERIFIED","REJECTED"], required: true, default: "PENDING" },
  certificatePath: { type: String },
  verifiedAt: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (workshopSchema.path('email')) workshopSchema.index({ email: 1 });
if (workshopSchema.path('status')) workshopSchema.index({ status: 1 });
if (workshopSchema.path('createdAt')) workshopSchema.index({ createdAt: -1 });
if (workshopSchema.path('role')) workshopSchema.index({ role: 1 });
if (workshopSchema.path('category')) workshopSchema.index({ category: 1 });

module.exports = mongoose.model('Workshop', workshopSchema);
