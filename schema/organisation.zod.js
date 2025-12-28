const { z } = require('zod');

const organisationSchema = z.object({
  name: z.string().min(1, "Organisation name is required").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  role: z.literal("organisation"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

module.exports = organisationSchema;