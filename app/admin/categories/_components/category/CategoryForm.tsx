"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

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
  const isEditing = !!initialData?._id;

  const existingImageUrl = initialData?.categoryImage
    ? `${IMAGE_BASE_URL}${initialData.categoryImage}`
    : null;

  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setNewFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Create mode requires an image
    if (!isEditing && !newFile) {
      toast.error("Please select a category image");
      fileRef.current?.focus();
      return;
    }

    const formData = new FormData(e.currentTarget);

    if (newFile) {
      formData.set("categoryImage", newFile);
    } else {
      formData.delete("categoryImage"); // keep existing on backend
    }

    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Category Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="e.g. Electronics"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryImage">
          Category Image{" "}
          {!isEditing && <span className="text-destructive">*</span>}
          {isEditing && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (leave empty to keep current)
            </span>
          )}
        </Label>

        {preview ? (
          <div className="relative w-full h-36 rounded-md overflow-hidden border group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreview(PLACEHOLDER_IMAGE)}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 rounded-md border-2 border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-amber-500 transition-colors"
          >
            <ImageIcon size={20} />
            <span className="text-xs font-medium">Click to upload image</span>
          </button>
        )}

        <Input
          ref={fileRef}
          id="categoryImage"
          name="categoryImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-muted-foreground hover:text-amber-600 underline underline-offset-2"
          >
            Change image
          </button>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-28">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
