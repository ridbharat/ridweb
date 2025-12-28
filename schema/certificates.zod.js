const { z } = require('zod');

const certificatesSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required").uuid("Invalid certificate ID format"),
  applicationId: z.string().min(1, "Application ID is required"),
  internName: z.string().min(1, "Intern name is required").max(100, "Name too long").trim(),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  description: z.string().min(10, "Description too short").max(500, "Description too long").trim(),
  certificateFile: z.object({
    filename: z.string().min(1, "Filename required"),
    path: z.string().min(1, "Path required"),
    url: z.string().url("Invalid URL"),
    size: z.number().min(1, "Invalid size").max(10 * 1024 * 1024, "File too large (max 10MB)"),
    contentType: z.string().regex(/^application\/(pdf|png|jpg|jpeg)$/, "Invalid file type"),
  }),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

module.exports = certificatesSchema;
