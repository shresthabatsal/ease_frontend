"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleAuthButton from "./GoogleAuthButton";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    startTransition(async () => {
      const result = await handleLogin(data);

      if (result.success) {
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-96"
    >
      {/* Email Field */}
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

      {/* Password Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" />
          Remember me
        </label>
        <button
          type="button"
          className="underline hover:text-yellow-500"
          onClick={() => router.push("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      {/* Login Button */}
      <Button type="submit" disabled={isSubmitting || pending}>
        {isSubmitting || pending ? "Logging in..." : "Login"}
      </Button>

      {/* Signup Link */}
      <p className="text-center text-sm">
        Don't have an account?{" "}
        <span
          className="underline cursor-pointer hover:text-yellow-500"
          onClick={() => router.push("/register")}
        >
          Create one
        </span>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-1" />
        <span className="text-sm">or</span>
        <hr className="flex-1" />
      </div>

      {/* Continue with Google */}
      <GoogleAuthButton />
    </form>
  );
}
