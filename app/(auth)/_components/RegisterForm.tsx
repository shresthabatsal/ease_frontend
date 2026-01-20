"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { handleRegister } from "@/lib/actions/auth-action";

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-96">

      {/* Full Name Field */}
      <TextField
        type="text"
        placeholder="Full Name"
        {...register("fullName")}
        error={errors.fullName?.message}
      />

      {/* Phone Number Field */}
      <TextField
        type="tel"
        placeholder="Phone Number"
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />

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

      {/* Confirm Password Field */}
      <TextField
        type="password"
        placeholder="Confirm Password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

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
      <Button type="submit" variant="primary" disabled={isSubmitting || pending}>
        {isSubmitting || pending ? "Creating account..." : "Sign Up"}
      </Button>

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
      <Button type="button" variant="google">
        Continue with Google
      </Button>
    </form>
  );
}