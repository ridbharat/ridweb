const mongoose = require("mongoose");

const organisationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true }, // organisation
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organisation", organisationSchema);
