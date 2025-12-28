const User = require("../models/user");

// Store OTP and its expiry in the database
exports.storeOTP = async (email, otp) => {
  try {
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await User.findOneAndUpdate({ email }, { otp, otpExpiry }, { new: true });
  } catch (error) {
    console.error("Error storing OTP:", error.message);
    throw error;
  }
};

// Validate the OTP
exports.validateOTP = async (email, otp) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return false; // User not found
    }

    // Check if the OTP matches and is not expired
    if (user.otp === otp && user.otpExpiry > new Date()) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error validating OTP:", error.message);
    return false;
  }
};
