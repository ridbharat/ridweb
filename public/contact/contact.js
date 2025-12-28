// Ensure the app is initialized at the very beginning
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");

// Initialize express app (THIS MUST COME FIRST)
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, "public"))); // This comes after app initialization
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 100 * 1024 * 1024 },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Example routeapp.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
// app.get("/contact", (req, res) =>
//   res.sendFile(path.join(__dirname, "public", "contact.html"))
// );

// Start the server
// const port = process.env.PORT || 3001;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
