const { z } = require('zod');

const applicationsSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  applicationType: z.enum(["internship", "workshop", "training"], { message: "Invalid application type" }).default("internship"),
  fullName: z.string().min(1, "Full name is required").max(100, "Name too long").trim(),
  fatherName: z.string().max(100, "Father name too long").trim().optional(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  course: z.string().max(100, "Course name too long").trim().optional(),
  certificateType: z.enum(["CERTIFICATE_OF_COMPLETION", "EXPERIENCE_LETTER", "workshop", "training"], { message: "Invalid certificate type" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email").toLowerCase(),
  duration: z.number().int().min(1, "Duration must be at least 1").max(1000, "Duration too large"),
  durationUnit: z.enum(["hours", "days", "weeks", "months"], { message: "Invalid duration unit" }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  projectName: z.string().max(200, "Project name too long").trim().optional(),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"], { message: "Invalid status" }).default("PENDING"),
  verifiedAt: z.string().optional(),
  certificatePath: z.string().optional(),
  verifiedBy: z.string().optional(),
  notes: z.string().max(500, "Notes too long").optional(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

module.exports = applicationsSchema;
