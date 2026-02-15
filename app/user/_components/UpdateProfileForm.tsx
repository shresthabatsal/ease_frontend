"use client";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTransition } from "react";
import { handleUpdateProfile } from "@/lib/actions/user-action";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
          await onProfileUpdated();
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
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          {...register("fullName", {
            required: "Full name is required",
            minLength: { value: 2, message: "Name is too short" },
          })}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Enter your phone number"
          {...register("phoneNumber", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9+\-\s()]{8,15}$/,
              message: "Invalid phone number format",
            },
          })}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating Profile..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
