const { z } = require('zod');

const usersSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
  lastname: z.string().max(50, "Last name too long").trim().optional(),
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  dob: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
  gender: z.enum(["male", "female", "other"], { message: "Invalid gender" }).optional(),
  role: z.enum(["student", "teacher", "organisation", "admin"], { message: "Invalid role" }).default("student"),
  companyName: z.string().max(100, "Company name too long").trim().optional(),
  isActive: z.boolean().default(true).optional(),
  lastLogin: z.string().optional(),
  profileImage: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.object({
    street: z.string().max(100, "Street too long"),
    city: z.string().max(50, "City too long"),
    state: z.string().max(50, "State too long"),
    zipCode: z.string().max(20, "Zip code too long"),
    country: z.string().max(50, "Country too long"),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// For registration (password required)
const userRegistrationSchema = usersSchema.omit({ isActive: true, lastLogin: true, createdAt: true, updatedAt: true });

// For login
const userLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// For profile update (partial)
const userUpdateSchema = usersSchema.partial().omit({ password: true, email: true });

module.exports = {
  usersSchema,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema
};
