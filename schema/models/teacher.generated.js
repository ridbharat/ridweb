const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ["male","female","other"], required: true },
  role: { type: Number, enum: [undefined], required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (teacherSchema.path('email')) teacherSchema.index({ email: 1 });
if (teacherSchema.path('status')) teacherSchema.index({ status: 1 });
if (teacherSchema.path('createdAt')) teacherSchema.index({ createdAt: -1 });
if (teacherSchema.path('role')) teacherSchema.index({ role: 1 });
if (teacherSchema.path('category')) teacherSchema.index({ category: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
