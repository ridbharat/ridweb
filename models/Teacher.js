const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    role: { type: String, required: true }, // teacher
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
