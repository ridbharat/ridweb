const { z } = require('zod');

const ebookUserSchema = z.object({
  username: z.string().min(3, "Username too short").max(30, "Username too long").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"], { message: "Invalid role" }).default("admin"),
  lastLogin: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// For login
const ebookUserLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  ebookUserSchema,
  ebookUserLoginSchema
};