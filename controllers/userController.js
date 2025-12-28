const User = require("../schema/models/users.generated");

exports.registerUser = async (req, res) => {
  try {
    // req.body is already validated by Zod middleware
    const userData = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Create new user (password is hashed by pre-save hook)
    const user = new User(userData);
    await user.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};
