const jwt = require("jsonwebtoken");
const User = require('../schema/models/ebookuser.generated');

// ============ SESSION-BASED AUTHENTICATION ============

// Session-based authentication middleware (for web routes)
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/ebook/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
};

// Check if user is authenticated (for API routes)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({
            error: 'Authentication required',
            redirect: '/ebook/login'
        });
    }
};

// Admin role check
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            error: 'Admin access required'
        });
    }
};

// ============ JWT-BASED AUTHENTICATION ============

// JWT authentication middleware (from authMiddleware.js)
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

// JWT authentication with user ID attachment (from isAuthenticated.js)
const jwtAuth = (req, res, next) => {
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

// JWT authentication with error handler (from aithlogin.js)
const jwtAuthWithError = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new Error("please login in to access the resource"));
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.id = id;
        next();
    } catch (error) {
        return next(error);
    }
};

// Comprehensive JWT verification (from verifyToken.js)
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - no token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - invalid token"
            });
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.log("Error in verifyToken: ", error);
        return res.status(403).json({
            success: false,
            message: "Forbidden - invalid token"
        });
    }
};

// ============ ROLE-BASED AUTHORIZATION ============

// Role authorization middleware (from authorizeRole.js)
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized: No user information found"
            });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                message: "Access forbidden: Unauthorized role"
            });
        }

        next();
    };
};

// ============ UTILITY FUNCTIONS ============

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
    // Session-based auth
    requireAuth,
    isAuthenticated,
    requireAdmin,

    // JWT-based auth
    authenticateJWT,
    jwtAuth,
    jwtAuthWithError,
    verifyToken,

    // Role-based auth
    authorizeRole,

    // Utilities
    generateToken
};