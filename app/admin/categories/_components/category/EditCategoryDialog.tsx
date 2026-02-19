"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { handleUpdateCategory } from "@/lib/actions/admin/category-action";
import { CategoryData, CategoryForm } from "./CategoryForm";

interface EditCategoryDialogProps {
  category: CategoryData | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCategoryDialog({
  category,
  open,
  onClose,
  onSuccess,
}: EditCategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!category) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Only include image if a new file was selected
      const imageFile = formData.get("categoryImage") as File;
      if (!imageFile || imageFile.size === 0) {
        formData.delete("categoryImage");
      }

      const result = await handleUpdateCategory(category!._id, formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <CategoryForm
          initialData={category}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Update Category"
        />
      </DialogContent>
    </Dialog>
  );
}
