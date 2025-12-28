const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    role: { type: String, required: true }, // student
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
