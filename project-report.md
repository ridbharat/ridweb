# RID Bharat Project Report

## Project Overview

RID Bharat is a comprehensive Node.js web application designed as an educational and professional development platform. The system manages user authentication, certificate generation and verification, e-book library services, workshop applications, and administrative functions. It serves students, teachers, organizations, and administrators in a secure, role-based environment.

Key functionalities include:
- Multi-role user registration and authentication
- Certificate application processing and PDF generation
- Secure e-book library with protected PDF viewing
- Workshop application management
- Administrative dashboard for oversight and verification

## Technologies and Dependencies

### Backend Framework
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework for routing and middleware
- **EJS**: Templating engine for server-side rendering

### Database
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **connect-mongo**: MongoDB session store
- **helmet**: Security middleware for HTTP headers
- **cors**: Cross-origin resource sharing

### File Handling & Media
- **multer**: File upload middleware
- **cloudinary**: Cloud storage for images and media
- **pdfkit**: PDF generation library
- **flipbook.js**: PDF viewer library

### Communication
- **nodemailer**: Email sending functionality

### Utilities
- **dotenv**: Environment variable management
- **crypto**: Cryptographic functions for OTP generation
- **fs/promises**: File system operations

## Architecture

### MVC Pattern
The application follows the Model-View-Controller architectural pattern:

- **Models** (`/models/`): Mongoose schemas defining data structures
- **Views** (`/views/`): EJS templates for rendering HTML pages
- **Controllers** (`/controllers/`): Business logic handlers

### Route Organization
- Modular routing with separate route files (`/routes/`)
- RESTful API design for different functionalities
- Middleware integration for authentication and authorization

### Middleware Layers
- **Authentication middleware**: JWT token validation
- **Authorization middleware**: Role-based access control
- **Upload middleware**: File handling and validation
- **Security middleware**: HTTP security headers and CORS

## Key Components

### User Management System
- **Multi-role authentication**: Student, Teacher, Organization, Admin
- **JWT-based sessions**: Secure token storage in HTTP-only cookies
- **Password reset**: OTP-based recovery via email
- **Profile management**: User data updates and role assignments

### Certificate Management Module
- **Application submission**: Detailed forms with validation
- **Admin verification workflow**: Status tracking (Pending → Verified/Rejected)
- **PDF generation**: Dynamic certificate creation using PDFKit
- **Secure downloads**: Token-protected file access
- **Email notifications**: Automated updates at each stage

### E-book Library System
- **Independent authentication**: Separate login system for library access
- **PDF upload management**: Cover image and metadata handling
- **Secure viewing**: JavaScript-based protection against printing/downloading
- **Statistics tracking**: View and download counters
- **Categorization**: Organized content structure

### Workshop Management
- **Application processing**: Similar workflow to certificates
- **Duration tracking**: Project timeline management
- **Status updates**: Administrative approval process

### Administrative Dashboard
- **User oversight**: Account management and statistics
- **Application verification**: Bulk processing capabilities
- **Emergency controls**: System reset functionality
- **Reporting**: Analytics and data insights

## Data Flow

### User Registration/Login Flow
1. User submits registration/login form
2. Controller validates input data
3. Password hashed using bcryptjs
4. User data stored in MongoDB via Mongoose
5. JWT token generated and sent in HTTP-only cookie
6. User redirected based on role permissions

### Certificate Application Flow
1. User completes detailed application form
2. Data validated and saved to Applications collection
3. Email notification sent to administrators
4. Admin reviews and updates status in database
5. Upon approval, PDF certificate generated using PDFKit
6. Certificate stored securely and download link provided
7. User receives email confirmation with access instructions

### E-book Access Flow
1. User authenticates to e-book system
2. Library catalog displayed from Books collection
3. User selects e-book for viewing
4. Server streams PDF with security restrictions
5. JavaScript enforces viewing limitations
6. Download requests tracked and logged

### Authentication Middleware Flow
1. Incoming request intercepted by auth middleware
2. JWT token extracted from cookies
3. Token verified using secret key
4. User data retrieved from database
5. User object attached to request for route handlers
6. Unauthorized requests redirected to login

## File Structure

```
/home/inxeoz/Work/tries/2025-12-28-rid/rid-completed/
├── config/
│   ├── db.js              # MongoDB connection configuration
│   └── passport.js        # Passport.js authentication setup
├── controllers/
│   ├── adminController.js      # Admin dashboard logic
│   ├── applicationController.js # Certificate applications
│   ├── authController.js       # Authentication handlers
│   ├── authebookController.js  # E-book authentication
│   ├── bookController.js       # Book management
│   ├── excelController.js      # Excel export functionality
│   ├── organisationController.js # Organization management
│   ├── pdfController.js        # PDF handling
│   ├── tokenbased.js           # Token-based operations
│   ├── userController.js       # User management
│   ├── verifyController.js     # Verification processes
│   └── workshopcontroller.js   # Workshop applications
├── middleware/
│   ├── aithlogin.js        # Authentication middleware
│   ├── auth.js             # General auth functions
│   ├── authMiddleware.js   # JWT middleware
│   ├── authorizeRole.js    # Role-based access control
│   ├── isAuthenticated.js  # Authentication checks
│   └── upload.js           # File upload configuration
├── models/
│   ├── Application.js      # Certificate application schema
│   ├── Book.js             # E-book schema
│   ├── certificate.js      # Certificate schema
│   ├── ebookModel.js       # E-book user schema
│   ├── EbookUser.js        # E-book user data
│   ├── Organisation.js     # Organization schema
│   ├── PDF.js              # PDF document schema
│   ├── Teacher.js          # Teacher schema
│   ├── user.js             # Main user schema
│   └── workshopmodels.js   # Workshop schema
├── public/
│   ├── assets/             # Static assets (images, CSS, JS)
│   ├── Certificate-Verification/ # Certificate verification pages
│   ├── EBookDashboard/     # E-book interface
│   ├── flip-book/          # PDF viewer components
│   ├── js/                 # Client-side JavaScript
│   └── workshop/           # Workshop-related pages
├── routes/
│   ├── admin.js            # Admin routes
│   ├── applicationRoutes.js # Application routes
│   ├── authebookRoutes.js  # E-book auth routes
│   ├── authRoutes.js       # Authentication routes
│   ├── bookRoutes.js       # Book management routes
│   ├── certificateRoutes.js # Certificate routes
│   ├── contactRoutes.js    # Contact form routes
│   ├── excelRoutes.js      # Excel export routes
│   ├── organisation.js     # Organization routes
│   ├── organisationRoutes.js # Alternative org routes
│   ├── pdfRoutes.js        # PDF routes
│   ├── protected.js        # Protected routes
│   ├── quizRoutes.js       # Quiz routes
│   ├── rtsRoutes.js        # RTS routes
│   ├── testRoutes.js       # Test routes
│   ├── userRoutes.js       # User routes
│   ├── verify.js           # Verification routes
│   └── workshopRoutes.js   # Workshop routes
├── utils/
│   ├── jwt.js              # JWT utilities
│   ├── otpUtils.js         # OTP generation
│   ├── sendEmail.js        # Email sending utilities
│   ├── showToast.js        # Toast notification utilities
│   ├── backblazeorg.js     # Backblaze organization utils
│   └── backblazeService.js  # Backblaze service
├── views/
│   ├── ebook/              # E-book related templates
│   ├── 404.ejs             # Error page
│   ├── contact.ejs         # Contact form
│   ├── dashboard.ejs       # User dashboard
│   ├── detail-ebook.ejs    # E-book detail view
│   ├── ebook.ejs           # E-book listing
│   ├── error.ejs           # Error template
│   ├── flipbook.ejs        # PDF viewer
│   ├── forgot-password.ejs # Password reset
│   ├── organization-dashboard.ejs # Org dashboard
│   ├── register-org.ejs    # Organization registration
│   ├── reset-password.ejs  # Password reset form
│   ├── searchResults.ejs   # Search results
│   └── success.ejs         # Success page
├── .gitignore              # Git ignore rules
├── bun.lock                # Bun package manager lock
├── package-lock.json       # NPM lock file
├── package.json            # Project dependencies and scripts
├── README.md               # Basic project documentation
└── server.js               # Main application entry point
```

## Security Features

### Authentication Security
- Password hashing with bcryptjs (salt rounds)
- JWT tokens with expiration times
- HTTP-only cookies for token storage
- Session invalidation on logout

### Data Protection
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection with Helmet
- CORS configuration for allowed origins

### File Security
- File type validation for uploads
- Size limits on file uploads
- Secure file storage paths
- Token-based access to sensitive files

### Certificate Security
- Digital signatures and watermarks
- Anti-tampering visual elements
- Secure download links with expiration
- Access logging and audit trails

## Deployment and Configuration

### Environment Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing key
- `EMAIL_USER`/`EMAIL_PASS`: SMTP credentials
- `CLOUDINARY_*`: Cloud storage configuration
- `SESSION_SECRET`: Session encryption key

### Production Considerations
- Process management with PM2 or similar
- Reverse proxy configuration (nginx)
- SSL/TLS certificate setup
- Database connection pooling
- Static file caching and CDN integration

### Monitoring and Logging
- Application logging for errors and events
- Database query monitoring
- User activity tracking
- Performance metrics collection

## Notable Implementation Details

### PDF Generation
Uses PDFKit for dynamic certificate creation with:
- Custom fonts and layouts
- Embedded images (signatures, logos)
- Multi-page support
- Print-quality output

### E-book Protection
Client-side JavaScript implements:
- Print prevention
- Right-click disabling
- Screenshot blocking
- Download restrictions

### Email System
Integrated notification system using Nodemailer:
- HTML email templates
- SMTP configuration
- Bulk email capabilities
- Error handling and retries

### File Upload System
Multer-based upload handling with:
- Multiple file type support
- Size validation
- Cloudinary integration for storage
- Progress tracking

This comprehensive platform demonstrates robust full-stack development practices with security, scalability, and user experience as primary considerations.