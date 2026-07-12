const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "One uppercase letter required")
    .regex(/[0-9]/, "One number required"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
};