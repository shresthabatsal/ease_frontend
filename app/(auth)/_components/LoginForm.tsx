"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    console.log("Login data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-96">
      {/* Email Field */}
      <div className="relative">
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full border border-black text-black px-4 py-3 rounded placeholder-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full border border-black text-black px-4 py-3 rounded placeholder-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

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
      <button
        type="submit"
        className="w-full px-4 py-3 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-600 transition"
      >
        Login
      </button>

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
      <button
        type="button"
        className="w-full px-4 py-3 bg-white text-black border border-black rounded hover:bg-gray-100 transition flex justify-center items-center gap-2"
      >
        Continue with Google
      </button>
    </form>
  );
}
