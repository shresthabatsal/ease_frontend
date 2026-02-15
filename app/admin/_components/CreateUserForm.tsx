"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "react-toastify";

import { handleCreateUser } from "@/lib/actions/admin/user-action";
import {
  AdminCreateUserInput,
  adminCreateUserSchema,
} from "../users/create/schema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateUserForm() {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      reset();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full max-w-2xl"
    >
      {/* Full Name */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label htmlFor="fullName" className="text-[15px] font-medium">
          Full Name
        </Label>
        <div>
          <Input
            id="fullName"
            placeholder="Enter full name"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label htmlFor="phoneNumber" className="text-[15px] font-medium">
          Phone Number
        </Label>
        <div>
          <Input
            id="phoneNumber"
            placeholder="Enter phone number"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500 mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label htmlFor="email" className="text-[15px] font-medium">
          Email
        </Label>
        <div>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Role */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label className="text-[15px] font-medium">Role</Label>
        <div>
          <Select
            defaultValue={watch("role")}
            onValueChange={(value) =>
              setValue("role", value as "USER" | "ADMIN")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label htmlFor="password" className="text-[15px] font-medium">
          Password
        </Label>
        <div>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center w-full">
        <Label htmlFor="confirmPassword" className="text-[15px] font-medium">
          Confirm Password
        </Label>
        <div>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Clear
        </Button>

        <Button type="submit" disabled={isSubmitting || pending}>
          {isSubmitting || pending ? "Creating user..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
