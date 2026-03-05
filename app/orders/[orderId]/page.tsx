"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder, getOrderPayment } from "@/lib/api/order";
import { Order, Payment, Product, resolveImg } from "@/components/ProductCard";
import PaymentReceiptDialog from "@/components/PaymentReceiptDialog";
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
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Calendar,
  Hash,
  Package,
  CheckCircle2,
  XCircle,
  Upload,
  Info,
  Store,
  Receipt,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IStore = {
  _id: string;
  storeName: string;
  location: string;
  pickupInstructions: string;
  storeImage?: string;
};

const ORDER_STATUS: Record<
  Order["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock size={12} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 size={12} />,
  },
  READY_FOR_COLLECTION: {
    label: "Ready for Pickup",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Package size={12} />,
  },
  COLLECTED: {
    label: "Collected",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <XCircle size={12} />,
  },
};

const PAYMENT_STATUS: Record<
  Order["paymentStatus"],
  { label: string; color: string }
> = {
  PENDING: {
    label: "Payment Pending",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  VERIFIED: {
    label: "Payment Verified",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  FAILED: {
    label: "Payment Failed",
    color: "bg-red-50 text-red-600 border-red-200",
  },
};

const FALLBACK_ORDER_STATUS = {
  label: "Unknown",
  color: "bg-slate-50 text-slate-600 border-slate-200",
  icon: <Clock size={12} />,
};
const FALLBACK_PAYMENT_STATUS = {
  label: "Unknown",
  color: "bg-slate-50 text-slate-600 border-slate-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-amber-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(orderId);
      setOrder(res.data ?? null);
    } catch {
      setOrder(null);
    }
  };

  const fetchPayment = async () => {
    try {
      const res = await getOrderPayment(orderId);
      setPayment(res.data ?? null);
    } catch {
      setPayment(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      const t = setTimeout(() => {
        if (!isAuthenticated) router.replace("/login");
      }, 100);
      return () => clearTimeout(t);
    }
    (async () => {
      setLoading(true);
      await Promise.all([fetchOrder(), fetchPayment()]);
      setLoading(false);
    })();
  }, [isAuthenticated, orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelOrder(orderId);
      if (res.success !== false) {
        toast.success("Order cancelled successfully");
        await fetchOrder();
      } else toast.error(res.message || "Failed to cancel order");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <Skeleton className="h-5 w-56 rounded-lg" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <Package size={48} className="text-slate-300" />
        <p className="text-sm">Order not found.</p>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const store =
    order.storeId && typeof order.storeId === "object"
      ? (order.storeId as IStore)
      : null;
  const storeName = store?.storeName ?? "Deleted Store";
  const pickupInstructions = store?.pickupInstructions ?? null;
  const orderStatus = ORDER_STATUS[order.status] ?? FALLBACK_ORDER_STATUS;
  const paymentStatus =
    PAYMENT_STATUS[order.paymentStatus] ?? FALLBACK_PAYMENT_STATUS;

  const canCancel = !["COLLECTED", "CANCELLED"].includes(order.status);
  const needsPayment =
    order.paymentStatus === "PENDING" && order.status !== "CANCELLED";
  const paymentFailed =
    order.paymentStatus === "FAILED" && order.status !== "CANCELLED";

  // OTP is available once payment is verified (CONFIRMED / READY_FOR_COLLECTION / COLLECTED)
  const otpVisible = [
    "CONFIRMED",
    "READY_FOR_COLLECTION",
    "COLLECTED",
  ].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
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
            <BreadcrumbLink asChild>
              <Link href="/orders">My Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-xs">
              #{order._id.slice(-8).toUpperCase()}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order Details</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={cn(
              "gap-1 border font-medium px-2 py-0.5",
              orderStatus.color
            )}
          >
            {orderStatus.icon}
            {orderStatus.label}
          </Badge>
          <Badge
            className={cn(
              "border font-medium px-2 py-0.5",
              paymentStatus.color
            )}
          >
            {paymentStatus.label}
          </Badge>
        </div>
      </div>

      {/* Deleted store warning */}
      {!store && (
        <div className="flex gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <Info size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500">
            The store associated with this order no longer exists.
          </p>
        </div>
      )}

      {/* Pickup instructions */}
      {pickupInstructions && (
        <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Info size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">
              Pickup Instructions — {storeName}
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              {pickupInstructions}
            </p>
          </div>
        </div>
      )}

      {/* Payment banners */}
      {needsPayment && !payment && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2.5">
            <Receipt size={16} className="text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Please submit your payment receipt to confirm this order.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setReceiptOpen(true)}
            className="flex-shrink-0 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none gap-1.5 h-8"
          >
            <Upload size={13} />
            Upload
          </Button>
        </div>
      )}

      {paymentFailed && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2.5">
            <XCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Your payment was rejected. Please resubmit your receipt.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setReceiptOpen(true)}
            className="flex-shrink-0 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none gap-1.5 h-8"
          >
            <Upload size={13} />
            Resubmit
          </Button>
        </div>
      )}

      {payment && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <CheckCircle2
            size={15}
            className={
              payment.status === "VERIFIED"
                ? "text-green-500"
                : payment.status === "REJECTED"
                ? "text-red-400"
                : "text-orange-400"
            }
          />
          <p className="text-xs text-slate-600">
            Receipt submitted
            {payment.paymentMethod ? ` via ${payment.paymentMethod}` : ""} ·{" "}
            <span
              className={cn(
                "font-semibold",
                payment.status === "VERIFIED"
                  ? "text-green-700"
                  : payment.status === "REJECTED"
                  ? "text-red-600"
                  : "text-orange-600"
              )}
            >
              {payment.status === "VERIFIED"
                ? "Verified"
                : payment.status === "REJECTED"
                ? "Rejected"
                : "Pending verification"}
            </span>
            {payment.verificationNotes
              ? ` — "${payment.verificationNotes}"`
              : ""}
          </p>
        </div>
      )}

      {/* Order info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
        <InfoRow icon={<Store size={14} />} label="Store" value={storeName} />
        <InfoRow
          icon={<Calendar size={14} />}
          label="Pickup Date"
          value={formatDate(order.pickupDate)}
        />
        <InfoRow
          icon={<Clock size={14} />}
          label="Pickup Time"
          value={order.pickupTime}
        />
        <InfoRow
          icon={<KeyRound size={14} />}
          label="OTP"
          value={
            otpVisible ? (
              <span className="font-mono font-bold tracking-[0.3em] text-base text-amber-600">
                {order.pickupCode}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Available after payment verification
              </span>
            )
          }
        />
        {order.notes && (
          <InfoRow
            icon={<Info size={14} />}
            label="Notes"
            value={order.notes}
          />
        )}
      </div>

      {/* OTP highlight card */}
      {otpVisible && order.pickupCode && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <KeyRound size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700">Your OTP</p>
            <p className="text-2xl font-bold font-mono tracking-[0.35em] text-amber-800">
              {order.pickupCode}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Show this to the store when collecting your order
            </p>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
        <h2 className="text-sm font-bold text-slate-800">Items Ordered</h2>
        <div className="flex flex-col gap-2.5">
          {order.items.map((item, idx) => {
            const product =
              typeof item.productId === "object"
                ? (item.productId as Product)
                : null;
            const imgSrc = product ? resolveImg(product.productImage) : null;
            const name = product?.name ?? "Deleted Product";
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rs. {item.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Total</span>
          <span className="text-lg font-bold text-slate-900">
            Rs. {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cancel action */}
      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={cancelling}
              className="self-start rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2"
            >
              <XCircle size={14} />
              {cancelling ? "Cancelling…" : "Cancel Order"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel your order and restore product stock. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Keep Order
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <PaymentReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        orderId={orderId}
        totalAmount={order.totalAmount}
        onSuccess={async () => {
          await Promise.all([fetchOrder(), fetchPayment()]);
        }}
      />
    </div>
  );
}
