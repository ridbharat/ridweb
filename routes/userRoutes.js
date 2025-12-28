// // const express = require('express');
// // const router = express.Router();
// // const userController = require('../controllers/userController');

// // router.post('/register', userController.registerUser);

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const { isAuthenticated } = require('../middleware/isAuthenticated');
// const User = require('../models/user'); // make sure this path is correct

// // Register route (already there)
// const userController = require('../controllers/userController');
// router.post('/register', userController.registerUser);

// // ✅ User profile route
// router.get('/me', isAuthenticated, async (req, res) => {
//   try {
//     const user = await User.findById(req.id).select("-password");
//     res.status(200).json({ success: true, user });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "User not found" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/isAuthenticated");
const userController = require("../controllers/userController");
const User = require("../models/user");

router.post("/register", userController.registerUser);


router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "User not found" });
  }
});

module.exports = router;
