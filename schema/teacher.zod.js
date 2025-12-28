const { z } = require('zod');

const teacherSchema = z.object({
  name: z.string().min(1, "First name is required").max(50, "Name too long").trim(),
  lastname: z.string().min(1, "Last name is required").max(50, "Last name too long").trim(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  gender: z.enum(["male", "female", "other"], { message: "Invalid gender" }),
  role: z.literal("teacher"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

module.exports = teacherSchema;