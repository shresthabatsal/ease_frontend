"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/lib/api/public";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Product, resolveImg } from "@/components/ProductCard";
import {
  ShoppingCart,
  Minus,
  Plus,
  ImageOff,
  ArrowLeft,
  Package,
  Tag,
  Layers,
  Store,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedStore } = useStore();
  const { addToCart } = useCart();

  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        setProduct(res.data ?? null);
      } catch (e) {
        console.error("Failed to load product:", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const imgSrc = resolveImg(product?.productImage);
  const inStock = (product?.quantity ?? 0) > 0;
  const maxQty = product?.quantity ?? 0;

  const categoryName =
    product && typeof product.categoryId === "object"
      ? product.categoryId.name
      : "";
  const subcategoryName =
    product && typeof product.subcategoryId === "object"
      ? product.subcategoryId.name
      : "";
  const storeName =
    product && typeof product.storeId === "object"
      ? product.storeId.storeName
      : selectedStore?.storeName ?? "";
  const storeId =
    product && typeof product.storeId === "object"
      ? product.storeId._id
      : selectedStore?._id ?? "";
  const categoryId =
    product && typeof product.categoryId === "object"
      ? product.categoryId._id
      : "";

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      toast.success(`${product.name} added to cart`);
    } catch {
      // error toast handled in CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    router.push(
      `/checkout?mode=buynow&productId=${product._id}&quantity=${quantity}&storeId=${storeId}`
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <Package size={48} className="text-slate-300" />
        <p className="text-sm">Product not found.</p>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft size={14} className="mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {categoryName && categoryId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/category/${categoryId}?storeId=${storeId}&catName=${encodeURIComponent(
                      categoryName
                    )}`}
                  >
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[180px]">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
              <ImageOff size={48} />
              <span className="text-sm text-slate-400">No image</span>
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {categoryName && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 gap-1">
                <Tag size={10} /> {categoryName}
              </Badge>
            )}
            {subcategoryName && (
              <Badge variant="secondary" className="gap-1 text-slate-600">
                <Layers size={10} /> {subcategoryName}
              </Badge>
            )}
            {storeName && (
              <Badge variant="outline" className="gap-1 text-slate-500">
                <Store size={10} /> {storeName}
              </Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                inStock ? "bg-green-500" : "bg-red-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                inStock ? "text-green-600" : "text-red-500"
              )}
            >
              {inStock
                ? `In stock · ${product.quantity} available`
                : "Out of stock"}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/*  Quantity selector */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-3 pt-2">
              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-20">
                  Quantity
                </span>
                <div className="flex items-center gap-0 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={decrement}
                    disabled={quantity <= 1 || !inStock}
                    className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="h-9 w-10 flex items-center justify-center text-sm font-semibold text-slate-800 border-x border-slate-200 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    disabled={quantity >= maxQty || !inStock}
                    className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
                >
                  {addingToCart ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                  {addingToCart ? "Adding…" : "Add to cart"}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 h-11 rounded-xl gap-2 bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none"
                >
                  <CreditCard size={16} />
                  Buy now
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-3">
                Please log in to add items to your cart or purchase.
              </p>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="flex-1 h-10 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
