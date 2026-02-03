"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-96">
      {/* Email Field */}
      <TextField
        type="email"
        placeholder="Email"
        {...register("email")}
        error={errors.email?.message}
      />

      {/* Password Field */}
      <TextField
        type="password"
        placeholder="Password"
        {...register("password")}
        error={errors.password?.message}
      />

      {/* Remember Me and Forgot Password */}
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2 text-black">
          <input type="checkbox" className="w-4 h-4" />
          Remember me
        </label>
        <button
          type="button"
          className="text-black underline hover:text-yellow-500"
        >
          Forgot password?
        </button>
      </div>

      {/* Login Button */}
      <Button type="submit" variant="primary" disabled={isSubmitting || pending}>
        {isSubmitting || pending ? "Logging in..." : "Login"}
      </Button>

      {/* Signup Link */}
      <p className="text-center text-sm text-black">
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
        <hr className="flex-1 border-black" />
        <span className="text-black text-sm">or</span>
        <hr className="flex-1 border-black" />
      </div>

      {/* Continue with Google */}
      <Button type="button" variant="google">
        Continue with Google
      </Button>
    </form>
  );
}
