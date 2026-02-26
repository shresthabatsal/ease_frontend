"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { createOrder, buyNow } from "@/lib/api/order";
import { getProductById } from "@/lib/api/public";
import PaymentReceiptDialog from "@/components/PaymentReceiptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import {
  ShoppingBag,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { syncCartToBackend } from "@/lib/api/cart";

interface OrderItem {
  product: Product;
  quantity: number;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { selectedStore } = useStore();
  const { items: cartItems, clearCart } = useCart();

  const mode = searchParams.get("mode") ?? "cart";
  const buyNowProductId = searchParams.get("productId") ?? "";
  const buyNowQuantityRaw = parseInt(searchParams.get("quantity") ?? "1");
  const buyNowQuantity = isNaN(buyNowQuantityRaw) ? 1 : buyNowQuantityRaw;
  const buyNowStoreId = searchParams.get("storeId") ?? selectedStore?._id ?? "";

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const storeId = mode === "buynow" ? buyNowStoreId : selectedStore?._id ?? "";
  const storeName = selectedStore?.storeName ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      const t = setTimeout(() => {
        if (!isAuthenticated) router.replace("/login");
      }, 100);
      return () => clearTimeout(t);
    }
    (async () => {
      setLoadingItems(true);
      if (mode === "buynow" && buyNowProductId) {
        try {
          const res = await getProductById(buyNowProductId);
          if (res.data)
            setOrderItems([{ product: res.data, quantity: buyNowQuantity }]);
        } catch {
          toast.error("Could not load product");
        }
      } else {
        setOrderItems(
          cartItems.map((ci) => ({
            product: ci.product,
            quantity: ci.quantity,
          }))
        );
      }
      setLoadingItems(false);
    })();
  }, [mode, buyNowProductId, buyNowQuantity, isAuthenticated, cartItems]);

  const totalAmount = orderItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const validate = () => {
    if (!pickupDate) {
      toast.error("Please select a pickup date");
      return false;
    }
    if (!pickupTime) {
      toast.error("Please select a pickup time");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("No items to order");
      return false;
    }
    if (!storeId) {
      toast.error("No store selected");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      let res;
      if (mode === "buynow") {
        const buyNowPayload = {
          productId: buyNowProductId,
          quantity: buyNowQuantity,
          storeId,
          pickupDate,
          pickupTime,
          notes: notes || undefined,
        };
        console.log("[Checkout] buyNow payload:", buyNowPayload);
        res = await buyNow(buyNowPayload);
      } else {
        await syncCartToBackend(cartItems);
        res = await createOrder({
          storeId,
          pickupDate,
          pickupTime,
          notes: notes || undefined,
        });
      }

      console.log("[Checkout] API response:", JSON.stringify(res));
      if (res.success !== false && res.data?._id) {
        setPlacedOrderId(res.data._id);
        setPlacedTotal(res.data.totalAmount ?? totalAmount);
        if (mode === "cart") clearCart();
        setReceiptOpen(true);
      } else {
        const msg =
          res.message ||
          (res.data && typeof res.data === "object"
            ? JSON.stringify(res.data)
            : "Failed to place order");
        toast.error(msg);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Something went wrong";
      toast.error(msg);
      console.error("[Checkout] error:", e?.response?.data ?? e);
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {mode === "cart" && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/cart">Cart</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Form */}
        <div className="flex flex-col gap-5">
          {/* Store banner */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100">
            <MapPin size={15} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-amber-500 font-medium">Pickup from</p>
              <p className="text-sm font-semibold text-amber-800">
                {storeName || "Selected store"}
              </p>
            </div>
          </div>

          {/* Pickup date */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="pickupDate"
              className="text-sm font-semibold flex items-center gap-1.5"
            >
              <Calendar size={14} className="text-amber-500" />
              Pickup Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickupDate"
              type="date"
              min={todayStr()}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="h-10 rounded-xl border-slate-200 focus-visible:ring-amber-400"
            />
          </div>

          {/* Pickup time */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="pickupTime"
              className="text-sm font-semibold flex items-center gap-1.5"
            >
              <Clock size={14} className="text-amber-500" />
              Pickup Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickupTime"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="h-10 rounded-xl border-slate-200 focus-visible:ring-amber-400"
            />
            <p className="text-xs text-muted-foreground">
              24-hour format (HH:MM)
            </p>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="notes"
              className="text-sm font-semibold flex items-center gap-1.5"
            >
              <FileText size={14} className="text-amber-500" />
              Notes{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions…"
              maxLength={500}
              rows={3}
              className="rounded-xl border-slate-200 resize-none text-sm focus-visible:ring-amber-400"
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </p>
          </div>

          {/* Payment notice */}
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
            <AlertCircle
              size={15}
              className="text-blue-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-blue-700 leading-relaxed">
              After placing your order you will be asked to upload your payment
              receipt. Your order will be confirmed once our team verifies the
              payment.
            </p>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-100 bg-white sticky top-24">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Order Summary</h2>
          </div>

          {loadingItems ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : orderItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No items
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
              {orderItems.map(({ product, quantity }) => {
                const imgSrc = resolveImg(product.productImage);
                return (
                  <div key={product._id} className="flex items-center gap-2.5">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ×{quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 flex-shrink-0">
                      Rs. {(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-lg font-bold text-slate-900">
              Rs. {totalAmount.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={placing || loadingItems || orderItems.length === 0}
            className="h-11 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none gap-2"
          >
            {placing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Placing order…
              </>
            ) : (
              "Place Order & Pay"
            )}
          </Button>
        </div>
      </div>

      {placedOrderId && (
        <PaymentReceiptDialog
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          orderId={placedOrderId}
          totalAmount={placedTotal}
          onSuccess={() => router.push("/orders")}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-8 flex flex-col gap-4">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
