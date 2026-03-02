"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Star,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRating, deleteRating, getProductRatings, IRating, ProductRatingsResponse, updateRating } from "@/lib/api/rating";

// Star display
function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(value)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }
        />
      ))}
    </div>
  );
}

// Interactive star picker
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 focus:outline-none"
          aria-label={`${s} star`}
        >
          <Star
            size={24}
            className={cn(
              "transition-colors",
              (hovered || value) >= s
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300 fill-slate-100"
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          {["", "Poor", "Fair", "Good", "Very good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

// Review form
function ReviewForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: { rating: number; review: string };
  onSubmit: (rating: number, review: string) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [review, setReview] = useState(initial?.review ?? "");

  const isEdit = !!initial;
  const canSubmit = rating > 0 && review.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(rating, review.trim());
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
      <p className="text-sm font-semibold text-slate-700">
        {isEdit ? "Edit your review" : "Write a review"}
      </p>

      <StarPicker value={rating} onChange={setRating} />

      <Textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your thoughts about this product…"
        rows={3}
        maxLength={500}
        className="rounded-xl resize-none text-sm border-slate-200 focus-visible:ring-amber-400"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {review.length}/500
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-xl h-8 px-3"
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl h-8 px-4 bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-1.5 shadow-none"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? "Save changes" : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Rating summary bar
function RatingSummary({ data }: { data: ProductRatingsResponse }) {
  const { averageRating, totalRatings, ratings } = data;
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: ratings.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      {/* Big average */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-4xl font-bold text-slate-900">
          {totalRatings > 0 ? averageRating.toFixed(1) : "—"}
        </span>
        <StarDisplay value={averageRating} size={13} />
        <span className="text-xs text-muted-foreground">
          {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex flex-col gap-1">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-3">{star}</span>
            <Star
              size={10}
              className="text-amber-400 fill-amber-400 flex-shrink-0"
            />
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{
                  width:
                    totalRatings > 0
                      ? `${(count / totalRatings) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-4 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Single review card
function ReviewCard({
  rating,
  currentUserId,
  onEdit,
  onDelete,
}: {
  rating: IRating;
  currentUserId?: string;
  onEdit: (r: IRating) => void;
  onDelete: (id: string) => void;
}) {
  const user = typeof rating.userId === "object" ? rating.userId : null;
  const name = user?.fullName ?? "Anonymous";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const isOwn =
    currentUserId &&
    (typeof rating.userId === "object" ? rating.userId._id : rating.userId) ===
      currentUserId;

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 p-4 rounded-2xl border",
        isOwn ? "border-amber-200 bg-amber-50/40" : "border-slate-100 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-800">{name}</p>
              {isOwn && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  You
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {new Date(rating.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <StarDisplay value={rating.rating} size={12} />
          {isOwn && (
            <>
              <button
                onClick={() => onEdit(rating)}
                className="ml-1 p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors"
                aria-label="Edit review"
              >
                <Pencil size={12} />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 size={12} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl sm:max-w-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Keep
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(rating._id)}
                      className="rounded-xl bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{rating.review}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { selectedStore } = useStore();
  const { addToCart } = useCart();

  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Ratings state
  const [ratingsData, setRatingsData] = useState<ProductRatingsResponse | null>(
    null
  );
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [editingRating, setEditingRating] = useState<IRating | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load product
  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        setProduct(res.data ?? null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // Load ratings
  const loadRatings = useCallback(async () => {
    if (!productId) return;
    setRatingsLoading(true);
    try {
      const data = await getProductRatings(productId);
      setRatingsData(data);
    } catch {
      // non-fatal
    } finally {
      setRatingsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const currentUserId = user?._id as string | undefined;

  const myRating = ratingsData?.ratings.find((r) => {
    const uid = typeof r.userId === "object" ? r.userId._id : r.userId;
    return uid === currentUserId;
  });

  const handleCreateRating = async (rating: number, review: string) => {
    setSubmitting(true);
    try {
      await createRating(productId, rating, review);
      toast.success("Review submitted!");
      await loadRatings();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRating = async (rating: number, review: string) => {
    if (!editingRating) return;
    setSubmitting(true);
    try {
      await updateRating(editingRating._id, rating, review);
      toast.success("Review updated!");
      setEditingRating(null);
      await loadRatings();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    try {
      await deleteRating(ratingId);
      toast.success("Review deleted");
      await loadRatings();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to delete review");
    }
  };

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* ── Breadcrumb ── */}
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

      {/* ── Product ── */}
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
          <div className="flex flex-wrap gap-2">
            {categoryName && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 gap-1">
                <Tag size={10} />
                {categoryName}
              </Badge>
            )}
            {subcategoryName && (
              <Badge variant="secondary" className="gap-1 text-slate-600">
                <Layers size={10} />
                {subcategoryName}
              </Badge>
            )}
            {storeName && (
              <Badge variant="outline" className="gap-1 text-slate-500">
                <Store size={10} />
                {storeName}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Average rating inline */}
          {ratingsData && ratingsData.totalRatings > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay value={ratingsData.averageRating} size={14} />
              <span className="text-sm font-semibold text-slate-700">
                {ratingsData.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({ratingsData.totalRatings}{" "}
                {ratingsData.totalRatings === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

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

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col gap-3 pt-2">
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

      {/* ── Ratings & Reviews ── */}
      <div className="flex flex-col gap-5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">
            Ratings & Reviews
          </h2>
        </div>

        {/* Summary */}
        {ratingsLoading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : ratingsData && ratingsData.totalRatings > 0 ? (
          <RatingSummary data={ratingsData} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        )}

        {/* Write / edit review — logged in users only */}
        {isAuthenticated && (
          <>
            {editingRating ? (
              <ReviewForm
                initial={{
                  rating: editingRating.rating,
                  review: editingRating.review,
                }}
                onSubmit={handleUpdateRating}
                onCancel={() => setEditingRating(null)}
                submitting={submitting}
              />
            ) : !myRating ? (
              <ReviewForm
                onSubmit={handleCreateRating}
                submitting={submitting}
              />
            ) : null}
          </>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-slate-500">
            <Link
              href="/login"
              className="text-amber-600 font-medium hover:underline"
            >
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}

        {/* Review list */}
        {ratingsData && ratingsData.ratings.length > 0 && (
          <div className="flex flex-col gap-3">
            {ratingsData.ratings.map((r) => (
              <ReviewCard
                key={r._id}
                rating={r}
                currentUserId={currentUserId}
                onEdit={(r) => setEditingRating(r)}
                onDelete={handleDeleteRating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
