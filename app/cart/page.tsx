"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { resolveImg } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  PackageOpen,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedStore } = useStore();
  const {
    items,
    totalPrice,
    itemCount,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <ShoppingCart size={48} className="text-slate-300" />
        <p className="text-sm text-muted-foreground">
          Please log in to view your cart.
        </p>
        <Button
          asChild
          className="rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none"
        >
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      await updateQuantity(cartItemId, quantity);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartItemId: string, name: string) => {
    setRemovingId(cartItemId);
    try {
      await removeFromCart(cartItemId);
      toast.success(`${name} removed from cart`);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearCart();
      toast.success("Cart cleared");
    } finally {
      setClearing(false);
    }
  };

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
          <BreadcrumbItem>
            <BreadcrumbPage>Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Cart
          </h1>
          {itemCount > 0 && (
            <span className="h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center">
              {itemCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {clearing ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Trash2 size={11} />
            )}
            Clear all
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <PackageOpen size={48} className="text-slate-300" />
          <p className="text-sm">Your cart is empty.</p>
          <Button asChild variant="outline" className="rounded-xl mt-1">
            <Link href="/">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Cart items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const product = item.productId;
              const imgSrc = resolveImg(product.productImage);
              const maxQty = product.quantity;
              const isUpdating = updatingId === item._id;
              const isRemoving = removingId === item._id;

              return (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 transition-all"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${product._id}`}
                    className="flex-shrink-0"
                  >
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                          No img
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product._id}`}>
                      <p className="text-sm font-semibold text-slate-800 truncate hover:text-amber-600 transition-colors">
                        {product.name}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rs. {product.price.toLocaleString()} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-0 mt-2 rounded-lg border border-slate-200 overflow-hidden w-fit">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="h-7 w-8 flex items-center justify-center text-xs font-semibold border-x border-slate-200 select-none">
                        {isUpdating ? (
                          <Loader2
                            size={11}
                            className="animate-spin text-amber-500"
                          />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= maxQty || isUpdating}
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900">
                      Rs. {item.subtotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemove(item._id, product.name)}
                      disabled={isRemoving}
                      className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-100 bg-white sticky top-24">
            <div className="flex items-center gap-2">
              <ShoppingBag size={15} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Summary</h2>
            </div>

            {selectedStore && (
              <div className="text-xs text-muted-foreground bg-slate-50 rounded-xl px-3 py-2">
                Pickup from{" "}
                <span className="font-semibold text-slate-700">
                  {selectedStore.storeName}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-sm">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground truncate max-w-[160px]">
                    {item.productId.name} ×{item.quantity}
                  </span>
                  <span className="font-medium text-slate-700">
                    Rs. {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total
              </span>
              <span className="text-lg font-bold text-slate-900">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              className="h-11 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={15} />
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-9 rounded-xl text-sm"
            >
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
