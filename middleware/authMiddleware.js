const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token; // Assuming you store the JWT in a cookie

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
    req.user = decoded; // Attach decoded user information to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = authenticateJWT;
