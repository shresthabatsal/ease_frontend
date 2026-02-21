"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "USER" | "ADMIN";
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "USER" | "ADMIN";
  profilePictureUrl?: File;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: "USER" | "ADMIN";
  password?: string;
  profilePictureUrl?: File;
}

interface UserFormProps {
  initialData?: Partial<UserData>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

export function UserForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  isEdit = false,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    password: "",
    role: (initialData?.role || "USER") as "USER" | "ADMIN",
  });

  const [preview, setPreview] = useState<string | null>(
    initialData?.profilePictureUrl
      ? `${IMAGE_BASE_URL}${initialData.profilePictureUrl}`
      : null
  );

  // Update formData when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        password: "",
        role: (initialData.role || "USER") as "USER" | "ADMIN",
      });

      if (initialData.profilePictureUrl) {
        setPreview(`${IMAGE_BASE_URL}${initialData.profilePictureUrl}`);
      }
    }
  }, [initialData]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const submitFormData = new FormData();
    submitFormData.append("fullName", formData.fullName);
    submitFormData.append("email", formData.email);
    submitFormData.append("phoneNumber", formData.phoneNumber);
    submitFormData.append("role", formData.role);

    // Only include password if it's provided
    if (formData.password) {
      submitFormData.append("password", formData.password);
    }

    // Handle profile picture - use "profilePicture" to match backend multer field name
    const fileInput = document.getElementById(
      "profilePicture"
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      submitFormData.append("profilePicture", fileInput.files[0]);
    }

    await onSubmit(submitFormData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profile Picture */}
      <div className="space-y-1.5">
        <Label htmlFor="profilePicture">Profile Picture</Label>
        {preview && (
          <div className="flex justify-center mb-2">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreview(PLACEHOLDER_IMAGE)}
              />
            </div>
          </div>
        )}
        <Input
          id="profilePicture"
          name="profilePicture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          placeholder="+977 9812345678"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password {!isEdit && "*"} {isEdit && "(leave empty to keep current)"}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="••••••••"
          required={!isEdit}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: "USER" | "ADMIN") =>
            setFormData({ ...formData, role: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-28">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
