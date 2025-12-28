const { z } = require('zod');

const booksSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").trim(),
  author: z.string().min(1, "Author is required").max(100, "Author name too long").trim(),
  description: z.string().min(10, "Description too short").max(1000, "Description too long").trim(),
  publishYear: z.number().int().min(1000, "Invalid year").max(new Date().getFullYear() + 1, "Future year not allowed").optional(),
  category: z.enum(["technical", "non-technical", "fiction", "non-fiction", "educational", "other"], { message: "Invalid category" }).default("other"),
  tags: z.array(z.string().max(30, "Tag too long").trim()).max(10, "Too many tags").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").default(4),
  language: z.string().max(50, "Language name too long").default("English"),
  isbn: z.string().regex(/^(?:\d{10}|\d{13})$/, "Invalid ISBN format").optional(),
  pages: z.number().int().min(1, "Must have at least 1 page").max(10000, "Too many pages").optional(),
  coverImage: z.object({
    filename: z.string().min(1, "Filename required"),
    path: z.string().min(1, "Path required"),
    url: z.string().url("Invalid URL"),
    size: z.number().min(1, "Invalid size"),
  }).optional(),
  pdfFile: z.object({
    filename: z.string().min(1, "Filename required"),
    originalFilename: z.string().min(1, "Original filename required"),
    path: z.string().min(1, "Path required"),
    url: z.string().url("Invalid URL"),
    size: z.number().min(1, "Invalid size"),
    contentType: z.string().regex(/^application\/pdf$/, "Must be PDF"),
  }).optional(),
  viewCount: z.number().int().min(0).default(0),
  downloadCount: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  uploadedBy: z.string().min(1, "Uploader required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// For creating new books (some fields optional)
const bookCreateSchema = booksSchema.omit({
  viewCount: true,
  downloadCount: true,
  isPublished: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true
});

// For updating books (all fields optional except those not allowed to change)
const bookUpdateSchema = booksSchema.partial().omit({
  uploadedBy: true,
  createdAt: true
});

module.exports = {
  booksSchema,
  bookCreateSchema,
  bookUpdateSchema
};
