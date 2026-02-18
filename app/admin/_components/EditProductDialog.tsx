"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm, ProductData } from "./ProductForm";
import { toast } from "sonner";
import { handleUpdateProduct } from "@/lib/actions/admin/product-action";

interface EditProductDialogProps {
  product: ProductData | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  open,
  onClose,
  onSuccess,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      const cleanedFormData = new FormData();

      for (const [key, value] of formData.entries()) {
        // Handle image separately
        if (key === "productImage") {
          const file = value as File;
          if (file && file.size > 0) {
            cleanedFormData.append(key, file);
          }
          continue;
        }

        if (value !== "") {
          cleanedFormData.append(key, value as string);
        }
      }

      const result = await handleUpdateProduct(product!._id, cleanedFormData);

      if (result.success) {
        toast.success(result.message);
        onClose();
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Update Product"
        />
      </DialogContent>
    </Dialog>
  );
}
