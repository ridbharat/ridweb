require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');

// Import required modules for routes
const { authenticateJWT } = require('./middleware/auth');
const Organisation = require('./schema/models/organisation.generated');
const Book = require('./schema/models/books.generated');

// Initialize express app
const app = express();
const port = process.env.PORT || 9191;

// MongoDB connection
const mongoUrl = process.env.MONGO_URI;

if (mongoUrl) {
  console.log('🔗 Attempting MongoDB Atlas connection...');
  mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
  })
  .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
      console.error('❌ MongoDB Atlas Connection Error:', err.message);
      console.log('⚠️ Continuing without database connection...');
  });
} else {
  console.log('⚠️ No MONGO_URI found, running without database connection');
}

// ========== MIDDLEWARE CONFIGURATION ==========
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const cors = require("cors");
const crypto = require("crypto");
const fileUpload = require("express-fileupload");
const fs = require("fs");

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Temporarily disable for debugging
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/ebook/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Create upload directories
const directories = ['public/uploads/pdfs', 'public/uploads/covers'];
directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${fullPath}`);
    } else {
        console.log(`📁 Directory exists: ${fullPath}`);
    }
});

// Additional middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}));
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Global variables middleware
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.success = req.query.success;
    res.locals.error = req.query.error;
    res.locals.user = req.user || req.session.user || null;
    res.locals.basePath = '/ebook';
    next();
});

// Initialize security storage
app.locals.securityEvents = new Map();
app.locals.pdfTokens = new Map();

// ========== CONFIGURE ROUTES ==========

// Secure PDF access middleware
app.use('/ebook/uploads/pdfs', (req, res, next) => {
  const referer = req.get('Referer');
  if (!referer || (!referer.includes('/ebook/secure-viewer/') && !referer.includes('/ebook/download/'))) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Direct file access is not allowed. Please use the secure viewer.'
    });
  }
  next();
});

// Role-based middleware
const roleMiddleware = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) return next();
  res.redirect("/login");
};

// ========== API ROUTES ==========

// Duration API
app.get("/api/util/duration", (req, res) => {
  const duration = process.env.DURATION || "30"; // Default 30 days
  res.json({ duration });
});

// ========== VIEW ROUTES ==========

// Books listing page
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find({});
    res.render("books", { moreBooks: books });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching books");
  }
});

// Flipbook viewer
app.get("/flipbook", (req, res) => {
  res.render("flipbook", {
    title: "RID Button Flipbook",
    pdfUrl: "/pdf/pdf.pdf",
    downloadUrl: "/images/pdf.rar",
  });
});

// Organization dashboard
app.get("/organization-dashboard", authenticateJWT, async (req, res) => {
  try {
    const organization = await Organisation.findOne();
    if (!organization) return res.status(404).send("Organization not found");
    res.render("organizationDashboard", { organization });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/organization-dashboard/:id", authenticateJWT, async (req, res) => {
  try {
    const organisationId = req.params.id;
    const organisation = await Organisation.findById(organisationId);
    if (!organisation)
      return res.status(404).json({ error: "Organization not found" });
    res.render("organization-dashboard", { organisation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Role-based pages
app.get("/organisation", authenticateJWT, roleMiddleware("organisation"), (req, res) => {
  res.render("register-org");
});

app.get("/teacher", authenticateJWT, roleMiddleware("teacher"), (req, res) => {
  res.render("pages/dashboard/teacher");
});

app.get("/student", authenticateJWT, roleMiddleware("student"), (req, res) => {
  res.render("pages/dashboard/student");
});

app.get("/admin", authenticateJWT, roleMiddleware("admin"), (req, res) => {
  res.render("pages/admin/admin");
});

// Auth pages
app.get("/reset-password", (req, res) => {
  res.render("auth/reset-password");
});

app.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password");
});

app.get("/form", (req, res) => {
  res.render("auth/form");
});

app.get("/onlineTest", (req, res) => {
  res.render("component/onlineTest");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/verify", (req, res) => {
  res.render("certificate/verify");
});

// Workshop form page
app.get("/workshop-form", (req, res) => {
  res.render("workshop/form");
});

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Additional page routes
app.get("/about", (req, res) => {
  res.render("about/about");
});

app.get("/serverpdf", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/certificate/serverpdf.html"));
});

// Certificate static routes
app.get("/certificate", (req, res) => {
  res.render("certificate/certificate");
});

app.get("/apply-certificate", (req, res) => {
  res.render("certificate/Applay-certificate");
});

app.get("/ebook", (req, res) => {
  res.render("ebook/ebook");
});

// Logout route
app.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Could not log out.");
      res.redirect("/login");
    });
  } else {
    res.json({ message: "Logged out successfully" });
  }
});

// Contact and about routes
app.get("/contact", (req, res) => res.render("contact/contact"));

// Redirects for old paths
app.get("/contact/contact.html", (req, res) => res.redirect("/pages/contact/contact.html"));
app.get("/about/about.html", (req, res) => res.redirect("/pages/about/about.html"));

// ========== EXISTING ROUTES ==========

// EBOOK ROUTES
app.use('/ebook', require('./routes/pdfRoutes'));
app.use('/ebook', require('./routes/authebookRoutes'));

// WORKSHOP ROUTES
const workshopRoutes = require('./routes/workshopRoutes');
app.use('/api/workshop', workshopRoutes);

// API ROUTES
const organisationRoutes = require("./routes/organisation");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const verifyRoutes = require("./routes/verify");

// Certificate routes
const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api", applicationRoutes);

// User and auth routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/verify", verifyRoutes);
app.use("/api/organisation", organisationRoutes);

// ========== CATCH-ALL 404 ==========
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// ========== START SERVER ==========
const server = app.listen(port, () => {
    const assignedPort = server.address().port;
    console.log(`✅ Server is running on http://localhost:${assignedPort}`);
});
// Server started above with all configurations applied