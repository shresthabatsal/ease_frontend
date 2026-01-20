import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: "Enter your name" }),
    phoneNumber: z
      .string()
      .min(10, { message: "Enter your phone number" })
      .regex(/^\d+$/, { message: "Phone must contain only numbers" }),
    email: z.string().email({ message: "Invalid email address" }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),

    confirmPassword: z.string(),

    terms: z.boolean(),
  })
  .refine((data) => data.terms === true, {
    path: ["terms"],
    message: "You must agree to the terms and conditions",
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
