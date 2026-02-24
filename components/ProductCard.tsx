"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Store {
  _id: string;
  storeName: string;
  location: string;
  pickupInstructions: string;
  storeImage?: string;
}

export interface Category {
  _id: string;
  name: string;
  categoryImage?: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  categoryId: string | Category;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  productImage: string;
  quantity: number;
  categoryId: Category | string;
  subcategoryId: Subcategory | string;
  storeId: Store | string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

export function resolveImg(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isAuthenticated?: boolean;
  compact?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  isAuthenticated,
  compact = false,
}: ProductCardProps) {
  const imgSrc = resolveImg(product.productImage);
  const categoryName =
    typeof product.categoryId === "object" ? product.categoryId.name : "";
  const inStock = product.quantity > 0;

  return (
    <Link href={`/product/${product._id}`} className="block">
      <Card
        className={cn(
          "group overflow-hidden border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 bg-white cursor-pointer",
          compact && "flex flex-row h-20"
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-slate-50 flex items-center justify-center",
            compact ? "w-20 flex-shrink-0" : "aspect-[4/3] w-full"
          )}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            /* Placeholder when no image */
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-100">
              <ImageOff size={compact ? 16 : 24} className="text-slate-300" />
              {!compact && (
                <span className="text-[10px] text-slate-400">No image</span>
              )}
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent
          className={cn(
            "flex flex-col gap-1",
            compact ? "flex-1 min-w-0 p-2 justify-center" : "p-3"
          )}
        >
          {categoryName && !compact && (
            <Badge
              variant="secondary"
              className="text-[10px] w-fit px-1.5 py-0 bg-amber-50 text-amber-600 border border-amber-100"
            >
              {categoryName}
            </Badge>
          )}

          <h3
            className={cn(
              "font-semibold text-slate-800 leading-tight",
              compact ? "text-xs truncate" : "text-sm truncate mt-0.5"
            )}
          >
            {product.name}
          </h3>

          {!compact && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-1">
            <span
              className={cn(
                "font-bold text-slate-900",
                compact ? "text-xs" : "text-sm"
              )}
            >
              Rs. {product.price.toLocaleString()}
            </span>

            {isAuthenticated && onAddToCart && !compact && (
              <Button
                size="icon"
                disabled={!inStock}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="h-7 w-7 rounded-full bg-[#F6B60D] hover:bg-amber-500 text-black shadow-none"
              >
                <ShoppingCart size={13} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
