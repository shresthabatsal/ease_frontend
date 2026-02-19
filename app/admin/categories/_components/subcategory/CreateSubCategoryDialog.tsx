"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { SubcategoryForm } from "./SubCategoryForm";
import { handleCreateSubcategory } from "@/lib/actions/admin/category-action";
import { CategoryData } from "../category/CategoryForm";

interface CreateSubcategoryDialogProps {
  categories: CategoryData[];
  onSuccess: () => void;
}

export function CreateSubcategoryDialog({
  categories,
  onSuccess,
}: CreateSubcategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: { name: string; categoryId: string }) {
    setLoading(true);
    try {
      const result = await handleCreateSubcategory(data);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
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
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Subcategory
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Subcategory</DialogTitle>
          </DialogHeader>
          <SubcategoryForm
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={loading}
            submitLabel="Create Subcategory"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
