"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SubcategoryData, SubcategoryForm } from "./SubCategoryForm";
import { CategoryData } from "../category/CategoryForm";
import { handleUpdateSubcategory } from "@/lib/actions/admin/category-action";

interface EditSubcategoryDialogProps {
  subcategory: SubcategoryData | null;
  categories: CategoryData[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSubcategoryDialog({
  subcategory,
  categories,
  open,
  onClose,
  onSuccess,
}: EditSubcategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!subcategory) return null;

  async function handleSubmit(data: { name: string; categoryId: string }) {
    setLoading(true);
    try {
      const result = await handleUpdateSubcategory(subcategory!._id, data);

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
          <DialogTitle>Edit Subcategory</DialogTitle>
        </DialogHeader>
        <SubcategoryForm
          initialData={subcategory}
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Update Subcategory"
        />
      </DialogContent>
    </Dialog>
  );
}
