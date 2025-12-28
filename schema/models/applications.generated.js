const mongoose = require('mongoose');

const applicationsSchema = new mongoose.Schema({
  appId: { type: String, required: true },
  applicationType: { type: String, enum: ["internship","workshop","training"], required: true, default: "internship" },
  fullName: { type: String, required: true },
  fatherName: { type: String },
  dob: { type: String, required: true },
  course: { type: String },
  certificateType: { type: String, enum: ["CERTIFICATE_OF_COMPLETION","EXPERIENCE_LETTER","workshop","training"], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  duration: { type: Number, required: true },
  durationUnit: { type: String, enum: ["hours","days","weeks","months"], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  projectName: { type: String },
  status: { type: String, enum: ["PENDING","VERIFIED","REJECTED"], required: true, default: "PENDING" },
  verifiedAt: { type: String },
  certificatePath: { type: String },
  verifiedBy: { type: String },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (applicationsSchema.path('email')) applicationsSchema.index({ email: 1 });
if (applicationsSchema.path('status')) applicationsSchema.index({ status: 1 });
if (applicationsSchema.path('createdAt')) applicationsSchema.index({ createdAt: -1 });
if (applicationsSchema.path('role')) applicationsSchema.index({ role: 1 });
if (applicationsSchema.path('category')) applicationsSchema.index({ category: 1 });

module.exports = mongoose.model('Applications', applicationsSchema);
