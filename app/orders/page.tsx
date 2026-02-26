"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/api/order";
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
  ShoppingBag,
  PackageOpen,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, Store } from "@/components/ProductCard";

const ORDER_STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock size={11} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 size={11} />,
  },
  READY_FOR_COLLECTION: {
    label: "Ready for Pickup",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Package size={11} />,
  },
  COLLECTED: {
    label: "Collected",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={11} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <XCircle size={11} />,
  },
};

const PAYMENT_STATUS_CONFIG: Record<
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAuthChecked(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await getUserOrders();
        setOrders(res.data ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [authChecked, isAuthenticated]);

  if (!authChecked || (!isAuthenticated && authChecked)) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
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
            <BreadcrumbPage>My Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-2">
        <ShoppingBag size={20} className="text-amber-500" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          My Orders
        </h1>
        {!loading && orders.length > 0 && (
          <span className="h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center">
            {orders.length}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <PackageOpen size={48} className="text-slate-300" />
          <p className="text-sm">You have no orders yet.</p>
          <Button asChild variant="outline" className="rounded-xl mt-1">
            <Link href="/">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const storeName =
              typeof order.storeId === "object"
                ? (order.storeId as Store).storeName
                : "Store";
            const statusCfg = ORDER_STATUS_CONFIG[order.status];
            const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus];
            const itemCount = order.items.length;

            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={16} className="text-amber-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">
                      {storeName}
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 border gap-1 font-medium",
                        statusCfg.color
                      )}
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 border font-medium",
                        paymentCfg.color
                      )}
                    >
                      {paymentCfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                    <span className="font-semibold text-slate-700">
                      Rs. {order.totalAmount.toLocaleString()}
                    </span>{" "}
                    · {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pickup: {formatDate(order.pickupDate)} at {order.pickupTime}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-amber-400 flex-shrink-0 transition-colors"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
