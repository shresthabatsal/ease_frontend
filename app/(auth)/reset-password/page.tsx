"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";
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

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return toast.error("Invalid or missing token");

    if (data.newPassword !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    startTransition(async () => {
      const res = await handleResetPassword(token, data.newPassword);

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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-96"
          >
            {/* New Password */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                {...register("newPassword", {
                  required: "New password is required",
                })}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={pending}>
              {pending ? "Resetting..." : "Reset Password"}
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
