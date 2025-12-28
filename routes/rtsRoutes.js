// routes/rtsRoutes.js
const express = require("express");
const router = express.Router();

// ---------------- RTS ROUTES ----------------
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../RTS", "public", "main.html"));
});

router.get("/category/test", (req, res) => {
  res.sendFile(path.join(__dirname, "../RTS", "public", "category", "test", "test.html"));
});

router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../RTS", "public", "Deshbord", "index.html"));
});

router.get("/test", (req, res) => res.send("RTS Test category"));
router.get("/test/jee", (req, res) => res.send("RTS JEE test"));
router.get("/test/mppsc", (req, res) => res.send("RTS MPPSC test"));
router.get("/test/10th", (req, res) => res.send("RTS 10th test"));
router.get("/test/12th", (req, res) => res.send("RTS 12th test"));

router.get("/feedback", (req, res) => res.send("RTS Feedback"));
router.get("/logout", (req, res) => res.send("RTS Logout"));

router.get("/my_profile", (req, res) => res.send("RTS Profile"));
router.get("/myPurchases", (req, res) => res.send("RTS Purchases"));

router.get("/privacyPolicy", (req, res) => res.send("RTS Privacy Policy"));
router.get("/refundPolicy", (req, res) => res.send("RTS Refund Policy"));
router.get("/terms", (req, res) => res.send("RTS Terms"));

router.get("/groupA/*", (req, res) => {
  const filePath = req.params[0];
  res.sendFile(path.resolve(__dirname, ../RTS/public/GroupA/${filePath}));
});

router.get("/groupB/*", (req, res) => {
  const filePath = req.params[0];
  res.sendFile(path.resolve(__dirname, ../RTS/public/GroupB/${filePath}));
});

router.get("/groupC/*", (req, res) => {
  const filePath = req.params[0];
  res.sendFile(path.resolve(__dirname, ../RTS/public/GroupC/${filePath}));
});

module.exports = router;