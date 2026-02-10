"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";

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
    watch,
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
    <div
      className="bg-gray-100 p-14 rounded-lg flex flex-col items-center gap-4
                    w-full max-w-[90%] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]"
    >
      <h1 className="text-2xl font-bold text-black">Reset Password</h1>
      <p className="text-black text-sm text-center">
        Enter your new password below.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-96"
      >
        <TextField
          type="password"
          placeholder="New Password"
          {...register("newPassword", { required: "New password is required" })}
          error={errors.newPassword?.message}
        />

        <TextField
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", {
            required: "Confirm password is required",
          })}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Resetting..." : "Reset Password"}
        </Button>

        <p
          className="text-sm text-black text-center underline cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Back to login
        </p>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
