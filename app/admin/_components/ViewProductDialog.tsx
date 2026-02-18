"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductData } from "./ProductForm";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface ViewProductDialogProps {
  product: ProductData | null;
  open: boolean;
  onClose: () => void;
}

function getStoreName(storeId: any): string {
  if (!storeId) return "—";
  if (typeof storeId === "object" && storeId.storeName)
    return storeId.storeName;
  if (typeof storeId === "object" && storeId._id) return storeId._id;
  return String(storeId);
}

function getCategoryName(categoryId: any): string {
  if (!categoryId) return "—";
  if (typeof categoryId === "object" && categoryId.name) return categoryId.name;
  if (typeof categoryId === "object" && categoryId._id) return categoryId._id;
  return String(categoryId);
}

function getSubcategoryName(subcategoryId: any): string {
  if (!subcategoryId) return "—";
  if (typeof subcategoryId === "object" && subcategoryId.name)
    return subcategoryId.name;
  if (typeof subcategoryId === "object" && subcategoryId._id)
    return subcategoryId._id;
  return String(subcategoryId);
}

export function ViewProductDialog({
  product,
  open,
  onClose,
}: ViewProductDialogProps) {
  if (!product) return null;

  const imageSrc = product.productImage
    ? `${IMAGE_BASE_URL}${product.productImage}`
    : PLACEHOLDER_IMAGE;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative w-full h-52 rounded-lg overflow-hidden border bg-muted">
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              NPR {product.price.toFixed(2)}
            </Badge>
            <Badge
              variant={product.quantity > 0 ? "default" : "destructive"}
              className="text-sm px-3 py-1"
            >
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : "Out of stock"}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">Store</p>
              <p>{getStoreName(product.storeId)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                Category
              </p>
              <p>{getCategoryName(product.categoryId)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                Subcategory
              </p>
              <p>{getSubcategoryName(product.subcategoryId)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                Product ID
              </p>
              <p className="font-mono text-xs break-all">{product._id}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium mb-0.5">Created</p>
              <p>{new Date(product.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium mb-0.5">Updated</p>
              <p>{new Date(product.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
