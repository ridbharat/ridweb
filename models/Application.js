const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  appId: { 
    type: String, 
    unique: true,   // ✅ enough, index auto banega
    required: true 
  },
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  dob: { type: String, required: true },
  course: { type: String, required: true },
  certificateType: {
    type: String,
    required: true,
    enum: ['CERTIFICATE_OF_COMPLETION', 'EXPERIENCE_LETTER']
  },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  duration: { type: String, required: true },
  durationUnit: {
    type: String,
    required: true,
    enum: ['weeks', 'months']
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  projectName: { type: String, required: true },
  status: {
    type: String,
    default: "PENDING",
    enum: ['PENDING', 'VERIFIED', 'REJECTED']
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// ✅ SAFE indexes (no conflict)
applicationSchema.index({ email: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
