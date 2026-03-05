"use client";

import { useForm } from "react-hook-form";
import { useTransition, useState } from "react";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = (data: ForgotPasswordForm) => {
    startTransition(async () => {
      const res = await handleRequestPasswordReset(data.email);
      if (res.success) {
        setSentTo(data.email);
        setSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-8">
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We sent a reset link to{" "}
                    <span className="font-medium text-slate-700">{sentTo}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-amber-600 hover:text-amber-700 font-medium underline"
                  >
                    Try again
                  </button>
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none mt-1"
                >
                  Back to login
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Forgot password?
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email address
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
                        {...register("email", {
                          required: "Email is required",
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none text-sm"
                  >
                    {pending ? "Sending…" : "Send Reset Link"}
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
    </div>
  );
}
