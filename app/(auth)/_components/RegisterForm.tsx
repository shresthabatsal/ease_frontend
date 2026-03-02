"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleRegister } from "@/lib/actions/auth-action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleAuthButton from "./GoogleAuthButton";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    startTransition(async () => {
      const result = await handleRegister(data);

      if (result.success) {
        alert("Account created successfully!");
        router.push("/login");
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-96"
    >
      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          {...register("terms")}
          className="mt-1 w-4 h-4"
        />
        <span>
          I agree to the{" "}
          <span className="underline cursor-pointer hover:text-yellow-500">
            Terms & Conditions
          </span>
        </span>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-500">{errors.terms.message}</p>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || pending}>
        {isSubmitting || pending ? "Creating account..." : "Sign Up"}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm">
        Already have an account?{" "}
        <span
          className="underline cursor-pointer hover:text-yellow-500"
          onClick={() => router.push("/login")}
        >
          Log in
        </span>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-1" />
        <span className="text-sm">or</span>
        <hr className="flex-1" />
      </div>

      {/* Google Button */}
      <GoogleAuthButton />
    </form>
  );
}
