"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "react-toastify";

import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { handleCreateUser } from "@/lib/actions/admin/user-action";
import {
  AdminCreateUserInput,
  adminCreateUserSchema,
} from "../users/create/schema";

export default function CreateUserForm() {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserInput>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = async (data: AdminCreateUserInput) => {
    startTransition(async () => {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("email", data.email);
      formData.append("role", data.role);
      formData.append("password", data.password);

      const result = await handleCreateUser(formData);

      if (!result?.success) {
        toast.error(result?.message || "Failed to create user");
        return;
      }

      toast.success(result?.message || "User created successfully");
      reset(); // clear only on success
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full max-w-2xl"
    >
      {/* Full Name */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">Full Name</label>
        <TextField
          placeholder="Enter full name"
          {...register("fullName")}
          error={errors.fullName?.message}
          className="w-full"
        />
      </div>

      {/* Phone Number */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">
          Phone Number
        </label>
        <TextField
          placeholder="Enter phone number"
          {...register("phoneNumber")}
          error={errors.phoneNumber?.message}
          className="w-full"
        />
      </div>

      {/* Email */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">Email</label>
        <TextField
          type="email"
          placeholder="Enter email"
          {...register("email")}
          error={errors.email?.message}
          className="w-full"
        />
      </div>

      {/* Role */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">Role</label>
        <SelectField
          {...register("role")}
          options={[
            { label: "USER", value: "USER" },
            { label: "ADMIN", value: "ADMIN" },
          ]}
          error={errors.role?.message}
          className="w-full"
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">Password</label>
        <TextField
          type="password"
          placeholder="Enter password"
          {...register("password")}
          error={errors.password?.message}
          className="w-full"
        />
      </div>

      {/* Confirm Password */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <label className="text-[15px] font-medium text-black">
          Confirm Password
        </label>
        <TextField
          type="password"
          placeholder="Confirm password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Clear
        </button>

        <button
          type="submit"
          disabled={isSubmitting || pending}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded font-medium disabled:opacity-60"
        >
          {isSubmitting || pending ? "Creating user..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
