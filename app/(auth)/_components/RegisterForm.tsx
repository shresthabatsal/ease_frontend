"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../schema";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    console.log("Register data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-96">
      {/* Email */}
      <div>
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

      {/* Password */}
      <div>
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

      {/* Confirm Password */}
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          className="w-full border border-black text-black px-4 py-3 rounded placeholder-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2 text-sm text-black">
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
        <p className="text-red-500 text-sm">{errors.terms.message}</p>
      )}

      {/* Sign Up Button */}
      <button
        type="submit"
        className="w-full px-4 py-3 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-600 transition"
      >
        Sign Up
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-black">
        Already have an account?{" "}
        <span
          className="underline cursor-pointer hover:text-yellow-500"
          onClick={() => router.push("/login")}
        >
          Log in
        </span>
      </p>
    </form>
  );
}
