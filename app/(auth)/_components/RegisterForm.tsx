"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
    console.log("Register data:", data);

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Account created successfully!");
      router.push("/login");
    });
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
        disabled={isSubmitting || pending}
        className="w-full px-4 py-3 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-600 transition disabled:opacity-60"
      >
        {isSubmitting || pending ? "Creating account..." : "Sign Up"}
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
