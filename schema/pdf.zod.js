const { z } = require('zod');

const pdfSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").trim(),
  description: z.string().max(1000, "Description too long").trim().optional(),
  filename: z.string().min(1, "Filename is required"),
  originalFilename: z.string().default("unknown.pdf"),
  coverImage: z.string().optional().nullable(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").default(4.0),
  category: z.enum(["technical", "non-technical", "other"], { message: "Invalid category" }).default("technical"),
  tags: z.array(z.string().max(50, "Tag too long").trim()).optional(),
  fileSize: z.number().min(0).default(0),
  viewCount: z.number().int().min(0).default(0),
  downloadCount: z.number().int().min(0).default(0),
  uploadDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// For creating new PDFs (some fields optional)
const pdfCreateSchema = pdfSchema.omit({
  viewCount: true,
  downloadCount: true,
  uploadDate: true,
  createdAt: true,
  updatedAt: true
});

// For updating PDFs
const pdfUpdateSchema = pdfSchema.partial().omit({
  filename: true,
  createdAt: true
});

module.exports = {
  pdfSchema,
  pdfCreateSchema,
  pdfUpdateSchema
};