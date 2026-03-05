"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleAuthButton from "./GoogleAuthButton";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    startTransition(async () => {
      const result = await handleLogin(data);
      if (result.success) {
        toast.success("Welcome back!");
        router.push("/");
      } else {
        toast.error(result.message);
      }
    });
  };

  const busy = isSubmitting || pending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </Label>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={busy}
        className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none text-sm mt-1"
      >
        {busy ? "Logging in…" : "Log in"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-amber-600 hover:text-amber-700 font-semibold"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
