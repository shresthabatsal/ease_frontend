"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleRegister } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleAuthButton from "./GoogleAuthButton";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    startTransition(async () => {
      const result = await handleRegister(data);
      if (result.success) {
        toast.success("Account created! Please log in.");
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    });
  };

  const busy = isSubmitting || pending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="fullName"
          className="text-sm font-medium text-slate-700"
        >
          Full Name
        </Label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="fullName"
            type="text"
            placeholder="Jane Doe"
            className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="phoneNumber"
          className="text-sm font-medium text-slate-700"
        >
          Phone Number
        </Label>
        <div className="relative">
          <Phone
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+977 98XXXXXXXX"
            className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </Label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </Label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-9 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            className="pl-9 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id="terms"
          {...register("terms")}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-400 cursor-pointer"
        />
        <label
          htmlFor="terms"
          className="text-sm text-slate-600 cursor-pointer leading-snug"
        >
          I agree to the{" "}
          <span className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2">
            Terms & Conditions
          </span>
        </label>
      </div>
      {errors.terms && (
        <p className="text-xs text-red-500 -mt-2">{errors.terms.message}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={busy}
        className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none text-sm"
      >
        {busy ? "Creating account…" : "Create Account"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-amber-600 hover:text-amber-700 font-semibold"
        >
          Log in
        </button>
      </p>
    </form>
  );
}
