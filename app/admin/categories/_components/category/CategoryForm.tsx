"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

export interface CategoryData {
  _id: string;
  name: string;
  categoryImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryData>;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: CategoryFormProps) {
  const [preview, setPreview] = useState<string | null>(
    initialData?.categoryImage
      ? `${IMAGE_BASE_URL}${initialData.categoryImage}`
      : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="e.g. Electronics"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryImage">Category Image</Label>
        {preview && (
          <div className="relative w-full h-36 rounded-md overflow-hidden border mb-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreview(PLACEHOLDER_IMAGE)}
            />
          </div>
        )}
        <Input
          ref={fileRef}
          id="categoryImage"
          name="categoryImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-28">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
