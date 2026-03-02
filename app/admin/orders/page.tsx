"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/context/StoreContext";
import { resolveImg } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  ChevronRight,
  Search,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  Trash2,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyOtpAction, updateOrderStatus, deleteOrderAction, fetchStoreOrders } from "@/lib/actions/admin/order-action";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY_FOR_COLLECTION"
  | "COLLECTED"
  | "CANCELLED";
type PaymentStatus = "PENDING" | "VERIFIED" | "FAILED";

interface OrderItem {
  productId:
    | { _id: string; name: string; price: number; productImage: string }
    | string;
  quantity: number;
  price: number;
}
interface Order {
  _id: string;
  userId: { _id: string; fullName: string; email: string } | string;
  storeId: { _id: string; storeName: string } | string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  pickupDate: string;
  pickupTime: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_CFG: Record<
  OrderStatus,
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
const PAYMENT_CFG: Record<PaymentStatus, { label: string; color: string }> = {
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

// Statuses admin can manually set (COLLECTED only via OTP)
const TRANSITIONS: Record<
  OrderStatus,
  Array<"READY_FOR_COLLECTION" | "CANCELLED">
> = {
  PENDING: [],
  CONFIRMED: ["READY_FOR_COLLECTION", "CANCELLED"],
  READY_FOR_COLLECTION: [],
  COLLECTED: [],
  CANCELLED: [],
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// OTP Dialog
function OtpDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    setLoading(true);
    const res = await verifyOtpAction(orderId, otp);
    setLoading(false);
    if (res.success) {
      toast.success("OTP verified — order marked as Collected");
      onSuccess();
      onOpenChange(false);
      setOtp("");
    } else {
      toast.error(res.message ?? "Invalid OTP");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Verify OTP & Collect</DialogTitle>
          <DialogDescription>
            Ask the customer for their OTP and enter it below to confirm
            collection.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp">Customer OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="rounded-xl text-center text-xl font-mono tracking-[0.4em] h-12"
              maxLength={6}
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="h-11 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <KeyRound size={15} />
                Verify & Collect
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Order Detail Dialog
function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onRefresh,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);

  if (!order) return null;

  const user = typeof order.userId === "object" ? order.userId : null;
  const statusCfg = STATUS_CFG[order.status];
  const paymentCfg = PAYMENT_CFG[order.paymentStatus];
  const transitions = TRANSITIONS[order.status];
  const canOtp = order.status === "READY_FOR_COLLECTION";
  const canDelete = order.status === "CANCELLED";

  const handleStatusChange = async (
    status: "READY_FOR_COLLECTION" | "CANCELLED"
  ) => {
    setUpdatingStatus(status);
    const res = await updateOrderStatus(order._id, status);
    setUpdatingStatus(null);
    if (res.success) {
      toast.success(`Order marked as ${STATUS_CFG[status].label}`);
      onRefresh();
      onOpenChange(false);
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  };

  const handleDelete = async () => {
    const res = await deleteOrderAction(order._id);
    if (res.success) {
      toast.success("Order deleted");
      onRefresh();
      onOpenChange(false);
    } else {
      toast.error(res.message ?? "Failed to delete");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order
              <span className="font-mono text-sm text-muted-foreground">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge
                className={cn(
                  "gap-1 border font-medium px-2 py-0.5",
                  statusCfg.color
                )}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </Badge>
              <Badge
                className={cn(
                  "border font-medium px-2 py-0.5",
                  paymentCfg.color
                )}
              >
                {paymentCfg.label}
              </Badge>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold">{user?.fullName ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            {/* Pickup info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                <Calendar size={13} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Date</p>
                  <p className="text-sm font-medium">{fmt(order.pickupDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                <Clock size={13} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Time</p>
                  <p className="text-sm font-medium">{order.pickupTime}</p>
                </div>
              </div>
            </div>

            {order.notes && (
              <p className="text-xs text-muted-foreground bg-slate-50 rounded-xl p-3">
                <span className="font-medium text-slate-600">Notes: </span>
                {order.notes}
              </p>
            )}

            {/* Items */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Items
              </p>
              {order.items.map((item, i) => {
                const product =
                  typeof item.productId === "object" ? item.productId : null;
                const imgSrc = product
                  ? resolveImg(product.productImage)
                  : null;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px]">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {product?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ×{item.quantity} · Rs. {item.price.toLocaleString()}{" "}
                        each
                      </p>
                    </div>
                    <span className="text-xs font-bold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">
                  Total
                </span>
                <span className="text-sm font-bold">
                  Rs. {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              {transitions.map((status) => (
                <Button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={!!updatingStatus}
                  className={cn(
                    "h-10 rounded-xl font-semibold gap-2",
                    status === "READY_FOR_COLLECTION"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  )}
                >
                  {updatingStatus === status ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    STATUS_CFG[status].icon
                  )}
                  Mark as {STATUS_CFG[status].label}
                </Button>
              ))}

              {canOtp && (
                <Button
                  onClick={() => setOtpOpen(true)}
                  className="h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                >
                  <KeyRound size={14} />
                  Verify OTP & Collect
                </Button>
              )}

              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl text-red-500 border-red-200 hover:bg-red-50 gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Only cancelled orders can be
                        deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">
                        Keep
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OtpDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        orderId={order._id}
        onSuccess={() => {
          onRefresh();
          onOpenChange(false);
        }}
      />
    </>
  );
}

// Main Page
export default function AdminOrdersPage() {
  const { selectedStore } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const storeId = selectedStore?._id ?? "";

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const res = await fetchStoreOrders(storeId);
    setLoading(false);
    if (res.success) setOrders(res.data ?? []);
    else toast.error(res.message ?? "Failed to load orders");
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = orders.filter((o) => {
    const user = typeof o.userId === "object" ? o.userId : null;
    const matchSearch =
      !search ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = orders.reduce(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedStore?.storeName ?? "Select a store to view orders"}
          </p>
        </div>
        <Button
          onClick={load}
          disabled={loading || !storeId}
          variant="outline"
          className="rounded-xl gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Status summary */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.keys(STATUS_CFG) as OrderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={cn(
                "flex flex-col gap-1 p-3 rounded-2xl border text-left transition-all",
                statusFilter === s
                  ? "border-amber-300 bg-amber-50 shadow-sm"
                  : "border-slate-100 bg-white hover:border-amber-200"
              )}
            >
              <span className="text-2xl font-bold">{counts[s] ?? 0}</span>
              <span className="text-xs text-muted-foreground">
                {STATUS_CFG[s].label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email…"
            className="pl-9 h-9 rounded-xl border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.keys(STATUS_CFG) as OrderStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CFG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!storeId && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
          <ShoppingBag size={40} className="text-slate-300" />
          <p className="text-sm">
            Select a store from the header to view orders.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading &&
        storeId &&
        (filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
            <Package size={40} className="text-slate-300" />
            <p className="text-sm">
              {orders.length === 0
                ? "No orders yet."
                : "No orders match filters."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((order) => {
              const user =
                typeof order.userId === "object" ? order.userId : null;
              return (
                <button
                  key={order._id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setDetailOpen(true);
                  }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all text-left w-full"
                >
                  <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={15} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">
                        {user?.fullName ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 border gap-1 font-medium",
                          STATUS_CFG[order.status].color
                        )}
                      >
                        {STATUS_CFG[order.status].icon}
                        {STATUS_CFG[order.status].label}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 border font-medium",
                          PAYMENT_CFG[order.paymentStatus].color
                        )}
                      >
                        {PAYMENT_CFG[order.paymentStatus].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} ·{" "}
                      <span className="font-semibold text-slate-700">
                        Rs. {order.totalAmount.toLocaleString()}
                      </span>{" "}
                      · Pickup: {fmt(order.pickupDate)} at {order.pickupTime}
                    </p>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-slate-300 group-hover:text-amber-400 flex-shrink-0 transition-colors"
                  />
                </button>
              );
            })}
          </div>
        ))}

      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRefresh={load}
      />
    </div>
  );
}
