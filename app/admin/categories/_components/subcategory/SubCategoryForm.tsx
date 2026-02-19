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
import { CategoryData } from "../category/CategoryForm";

export interface SubcategoryData {
  _id: string;
  name: string;
  categoryId: CategoryData | string;
  createdAt: string;
  updatedAt: string;
}

interface SubcategoryFormProps {
  initialData?: Partial<SubcategoryData>;
  categories: CategoryData[];
  onSubmit: (data: { name: string; categoryId: string }) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function SubcategoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: SubcategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    if (initialData?.categoryId) {
      const catId =
        typeof initialData.categoryId === "object"
          ? initialData.categoryId._id
          : initialData.categoryId;
      setCategoryId(catId);
    }
  }, [initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit({ name, categoryId });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Subcategory Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Smartphones"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Parent Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No categories available
              </div>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isLoading || !categoryId}
          className="min-w-28"
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
