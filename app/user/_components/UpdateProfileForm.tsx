"use client";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTransition } from "react";
import { handleUpdateProfile } from "@/lib/actions/user-action";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

interface UpdateProfileFormProps {
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  onProfileUpdated: () => void | Promise<void>;
}

export default function UpdateProfileForm({
  user,
  onProfileUpdated,
}: UpdateProfileFormProps) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    fullName: string;
    email: string;
    phoneNumber: string;
  }>({
    defaultValues: {
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    },
  });

  const onSubmit = (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
  }) => {
    startTransition(async () => {
      try {
        const res = await handleUpdateProfile(data);

        if (res?.success) {
          toast.success(res.message || "Profile updated successfully");
          // Refresh profile data
          await onProfileUpdated();
          // Reset form with the new values (optional but recommended)
          reset(data);
        } else {
          toast.error(res?.message || "Failed to update profile");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <TextField
          label="Full Name"
          {...register("fullName", {
            required: "Full name is required",
            minLength: { value: 2, message: "Name is too short" },
          })}
          error={errors.fullName?.message}
          placeholder="Enter your full name"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <TextField
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
          placeholder="Enter your email"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <TextField
          label="Phone Number"
          {...register("phoneNumber", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9+\-\s()]{8,15}$/,
              message: "Invalid phone number format",
            },
          })}
          error={errors.phoneNumber?.message}
          placeholder="Enter your phone number"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={pending}
          className={pending ? "opacity-70 cursor-not-allowed" : ""}
        >
          {pending ? "Updating Profile..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
