const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Teacher = require("../models/Teacher");
const Organisation = require("../models/Organisation");

exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      lastname,
      email,
      password,
      phone,
      dob,
      gender,
      role
    } = req.body;

    let Model;

    // 🔹 ROLE BASED MODEL
    if (role === "student") Model = User;
    else if (role === "teacher") Model = Teacher;
    else if (role === "organisation") Model = Organisation;
    else return res.status(400).send("Invalid role");

    // 🔹 Email duplicate check (role wise)
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.send("Email already exists");
    }

    // 🔹 Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Common data
    const data = {
      name: username,
      email,
      password: hashedPassword,
      phone,
      role,
    };

    // 🔹 Student / Teacher extra fields
    if (role !== "organisation") {
      data.lastname = lastname;
      data.dob = dob;
      data.gender = gender;
    }

    // 🔹 Save to correct collection
    await Model.create(data);

    // ✅ SIGNUP SUCCESS → LOGIN PAGE
    return res.redirect("/login");

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Registration failed");
  }
};
