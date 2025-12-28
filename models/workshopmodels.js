const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  appId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  certificateType: {
    type: String,
    enum: ['workshop', 'training'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  durationUnit: {
    type: String,
    enum: ['hours', 'weeks', 'months'],
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  certificatePath: {
    type: String,
    default: ""
  },
  verifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
workshopSchema.index({ appId: 1 });
workshopSchema.index({ email: 1 });
workshopSchema.index({ status: 1 });

module.exports = mongoose.model('WorkshopApplication', workshopSchema);