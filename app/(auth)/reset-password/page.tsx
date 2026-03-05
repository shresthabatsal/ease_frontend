"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const token = searchParams.get("token");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return toast.error("Invalid or missing reset token.");
    if (data.newPassword !== data.confirmPassword)
      return toast.error("Passwords do not match.");
    startTransition(async () => {
      const res = await handleResetPassword(token, data.newPassword);
      if (res.success) {
        setDone(true);
        toast.success(res.message);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src={logo}
              alt="Ease"
              width={52}
              height={34}
              className="h-auto"
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {done ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                <CheckCircle2 size={26} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Password reset!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your password has been updated. Redirecting to login…
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none"
              >
                Go to login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Set new password
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Must be at least 8 characters.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
                      {...register("newPassword", {
                        required: "New password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

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
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-400 text-sm"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                      })}
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

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none text-sm"
                >
                  {pending ? "Resetting…" : "Reset Password"}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-5 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mx-auto"
              >
                <ArrowLeft size={13} /> Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
