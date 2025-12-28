const { z } = require('zod');

const workshopApplicationSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  fullName: z.string().min(1, "Full name is required").max(100, "Name too long").trim(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  certificateType: z.enum(["workshop", "training"], { message: "Invalid certificate type" }),
  duration: z.number().int().min(1, "Duration must be at least 1").max(1000, "Duration too large"),
  durationUnit: z.enum(["hours", "weeks", "months"], { message: "Invalid duration unit" }),
  email: z.string().email("Invalid email"),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"], { message: "Invalid status" }).default("PENDING"),
  certificatePath: z.string().optional(),
  verifiedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

module.exports = workshopApplicationSchema;