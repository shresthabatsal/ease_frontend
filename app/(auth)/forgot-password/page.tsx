"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = (data: ForgotPasswordForm) => {
    startTransition(async () => {
      const res = await handleRequestPasswordReset(data.email);

      if (res.success) {
        toast.success(res.message);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <Image src={logo} alt="Logo" width={40} />
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-96" // same width as login form
          >
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Send Reset Link"}
            </Button>

            {/* Back to Login */}
            <p
              className="text-sm text-center underline cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Back to login
            </p>
          </form>
        </CardContent>
      </Card>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
