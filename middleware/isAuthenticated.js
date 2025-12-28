// const jwt = require("jsonwebtoken");

// exports.isAuthenticated = (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return res.status(401).json({ message: "Please log in to access this resource." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Store user info in request
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid or expired token." });
//   }
// };



const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Please log in to access this resource." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
