# Improved Database Schema Documentation

This document outlines the refactored, scalable, and robust database schema for the project. The schemas have been consolidated and improved for better maintainability, performance, and client-server compatibility.

## Database Collections & Schemas

### 1. **users** (Unified User Model)
- **name**: String (required, trim)
- **lastname**: String (trim, optional for organisations)
- **email**: String (required, unique, lowercase, trim)
- **password**: String (required, minlength: 6)
- **phone**: String (required, trim)
- **dob**: Date (optional for organisations)
- **gender**: Enum ['male', 'female', 'other'] (optional for organisations)
- **role**: Enum ['student', 'teacher', 'organisation', 'admin'] (required, default: 'student')
- **companyName**: String (trim, for organisations)
- **isActive**: Boolean (default: true)
- **lastLogin**: Date
- **profileImage**: String (URL/path)
- **address**: Object { street, city, state, zipCode, country }
- **createdAt/updatedAt**: Timestamps
- **Indexes**: email, role, isActive, createdAt
- **Methods**: password hashing, comparePassword, updateLastLogin
- **Statics**: findByRole, findActiveUsers, createDefaultAdmin

### 2. **applications** (Unified Application Model)
- **appId**: String (unique, required, trim)
- **applicationType**: Enum ['internship', 'workshop', 'training'] (required, default: 'internship')
- **fullName**: String (required, trim)
- **fatherName**: String (trim, optional for workshops)
- **dob**: Date (required)
- **course**: String (trim, optional for workshops)
- **certificateType**: Enum ['CERTIFICATE_OF_COMPLETION', 'EXPERIENCE_LETTER', 'workshop', 'training'] (required)
- **phone**: String (required, trim)
- **email**: String (required, lowercase, trim)
- **duration**: Number (required, min: 1)
- **durationUnit**: Enum ['hours', 'days', 'weeks', 'months'] (required)
- **startDate**: Date (required)
- **endDate**: Date (required)
- **projectName**: String (trim, optional for workshops)
- **status**: Enum ['PENDING', 'VERIFIED', 'REJECTED'] (default: 'PENDING')
- **verifiedAt**: Date
- **certificatePath**: String (trim, path to generated certificate)
- **verifiedBy**: ObjectId (ref: 'User')
- **notes**: String (trim)
- **isActive**: Boolean (default: true)
- **createdAt/updatedAt**: Timestamps
- **Indexes**: appId, email, status, applicationType, createdAt, verifiedAt
- **Virtuals**: durationString
- **Methods**: markAsVerified, markAsRejected
- **Statics**: findByType, findPending, getStats

### 3. **books** (Unified Book Model)
- **title**: String (required, trim, maxlength: 200)
- **author**: String (required, trim)
- **description**: String (required, trim, maxlength: 1000)
- **publishYear**: Number (min: 1000, max: current year +1)
- **category**: Enum ['technical', 'non-technical', 'fiction', 'non-fiction', 'educational', 'other'] (default: 'other')
- **tags**: Array of Strings (trim, lowercase)
- **rating**: Number (1-5, default: 4.0)
- **language**: String (default: 'English')
- **isbn**: String (trim)
- **pages**: Number (min: 1)
- **coverImage**: Object { filename, path, url, size }
- **pdfFile**: Object { filename, originalFilename, path, url, size, contentType }
- **viewCount**: Number (default: 0)
- **downloadCount**: Number (default: 0)
- **isPublished**: Boolean (default: true)
- **isFeatured**: Boolean (default: false)
- **uploadedBy**: ObjectId (ref: 'User')
- **createdAt/updatedAt**: Timestamps
- **Indexes**: Text search (title, author, description), category, tags, rating, viewCount, downloadCount, isPublished, createdAt
- **Methods**: incrementViewCount, incrementDownloadCount, getFileUrl
- **Statics**: findByCategory, findFeatured, searchBooks, getStats

### 4. **certificates** (Certificate Model)
- **certificateId**: String (required, unique)
- **applicationId**: ObjectId (ref: 'Application')
- **internName**: String (required)
- **issueDate**: Date (required)
- **description**: String (required)
- **certificateFile**: Object { filename, path, url, size, contentType }
- **isActive**: Boolean (default: true)
- **createdAt/updatedAt**: Timestamps
- **Indexes**: certificateId, applicationId, createdAt

### 5. **pdfs** (Deprecated - replaced by books collection)
- Note: This model is kept for backward compatibility but should be migrated to books

## Database Connection
- Uses MongoDB via Mongoose
- Connection string from `process.env.MONGO_URI`
- Collections created automatically on first use
- All defined indexes created automatically

## Key Improvements
- **Consolidated Models**: Reduced duplication (e.g., single User model for all roles)
- **Scalable Storage**: File paths/URLs instead of database buffers
- **Relationships**: ObjectId references for data integrity
- **Performance**: Comprehensive indexes including text search
- **Validation**: Constraints and enums for data quality
- **Methods**: Built-in business logic for common operations
- **Consistency**: Uniform naming, types, and patterns

## Migration Notes
- Existing data needs migration scripts for User consolidation
- File buffers in old models should be moved to filesystem/cloud
- Update application code to use new model references
- Test thoroughly before production deployment