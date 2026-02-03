import { z } from "zod";

export const adminCreateUserSchema = z
  .object({
    fullName: z.string().min(2, { message: "Enter full name" }),

    phoneNumber: z
      .string()
      .min(10, { message: "Enter phone number" })
      .regex(/^\d+$/, { message: "Phone must contain only numbers" }),

    email: z.string().email({ message: "Invalid email address" }),

    role: z.enum(["USER", "ADMIN"]),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),

    confirmPassword: z.string(),
  })
  .refine((data) => !!data.role, {
    path: ["role"],
    message: "Select a role",
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
