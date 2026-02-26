"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { resolveImg } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedStore } = useStore();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  } = useCart();

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

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    toast.success("Cart cleared");
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
          {totalItems > 0 && (
            <span className="h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center">
              {totalItems}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
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
            {items.map(({ product, quantity }) => {
              const imgSrc = resolveImg(product.productImage);
              const inStock = product.quantity > 0;
              const maxQty = product.quantity;

              return (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all"
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
                          updateQuantity(product._id, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="h-7 w-8 flex items-center justify-center text-xs font-semibold text-slate-800 border-x border-slate-200 select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product._id, quantity + 1)
                        }
                        disabled={quantity >= maxQty}
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Right: subtotal and remove */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900">
                      Rs. {(product.price * quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
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

            {/* Store */}
            {selectedStore && (
              <div className="text-xs text-muted-foreground bg-slate-50 rounded-xl px-3 py-2">
                Pickup from{" "}
                <span className="font-semibold text-slate-700">
                  {selectedStore.storeName}
                </span>
              </div>
            )}

            {/* Line items total */}
            <div className="flex flex-col gap-1.5 text-sm">
              {items.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground truncate max-w-[160px]">
                    {product.name} ×{quantity}
                  </span>
                  <span className="font-medium text-slate-700">
                    Rs. {(product.price * quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total
              </span>
              <span className="text-lg font-bold text-slate-900">
                Rs. {totalAmount.toLocaleString()}
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
