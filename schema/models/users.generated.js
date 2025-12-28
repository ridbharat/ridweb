const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String },
  gender: { type: String, enum: ["male","female","other"] },
  role: { type: String, enum: ["student","teacher","organisation","admin"], required: true, default: "student" },
  companyName: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: String },
  profileImage: { type: String, required: true },
  address: { type: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  } },
  createdAt: { type: String },
  updatedAt: { type: String },
}, {
  timestamps: true
});

// Indexes
if (usersSchema.path('email')) usersSchema.index({ email: 1 });
if (usersSchema.path('status')) usersSchema.index({ status: 1 });
if (usersSchema.path('createdAt')) usersSchema.index({ createdAt: -1 });
if (usersSchema.path('role')) usersSchema.index({ role: 1 });
if (usersSchema.path('category')) usersSchema.index({ category: 1 });

module.exports = mongoose.model('Users', usersSchema);
