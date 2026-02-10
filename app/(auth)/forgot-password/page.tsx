"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

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
        // Optionally redirect after 3 seconds
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
      <h1 className="text-2xl font-bold text-black">Forgot Password</h1>
      <p className="text-black text-sm text-center">
        Enter your email to receive reset link.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-96"
      >
        <TextField
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending..." : "Send Reset Link"}
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
