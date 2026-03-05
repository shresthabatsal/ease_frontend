"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Loader2,
  ChevronRight,
  ExternalLink,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  verifyPaymentAction,
  fetchStoreOrders,
  fetchOrderPayment,
} from "@/lib/actions/admin/order-action";

interface StoreOption {
  _id: string;
  storeName: string;
}
type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";
type OrderPaymentStatus = "PENDING" | "VERIFIED" | "FAILED";

interface OrderUser {
  _id: string;
  fullName: string;
  email: string;
}
interface Order {
  _id: string;
  userId: OrderUser | string;
  totalAmount: number;
  paymentStatus: OrderPaymentStatus;
  status: string;
  pickupDate: string;
  pickupTime: string;
  createdAt: string;
}
interface Payment {
  _id: string;
  orderId: string | any;
  userId: string | any;
  amount: number;
  paymentMethod?: string;
  receiptImage: string;
  notes?: string;
  status: PaymentStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  submittedAt: string;
  createdAt: string;
}
interface OrderWithPayment {
  order: Order;
  payment: Payment;
}

const PAY_STATUS_CFG: Record<PaymentStatus, { label: string; color: string }> =
  {
    PENDING: {
      label: "Awaiting Verification",
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    VERIFIED: {
      label: "Verified",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    REJECTED: {
      label: "Rejected",
      color: "bg-red-50 text-red-600 border-red-200",
    },
  };

function PayIcon({
  status,
  size = 11,
}: {
  status: PaymentStatus;
  size?: number;
}) {
  switch (status) {
    case "PENDING":
      return <Clock size={size} />;
    case "VERIFIED":
      return <CheckCircle2 size={size} />;
    case "REJECTED":
      return <XCircle size={size} />;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";
function resolveReceipt(path: string) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VerifyDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: OrderWithPayment | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (orderId: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"VERIFIED" | "REJECTED" | null>(null);
  useEffect(() => {
    if (!open) setNotes("");
  }, [open]);
  if (!item) return null;
  const { order, payment } = item;
  const user =
    typeof order.userId === "object" ? (order.userId as OrderUser) : null;
  const receiptSrc = resolveReceipt(payment.receiptImage);
  const cfg = PAY_STATUS_CFG[payment.status] ?? PAY_STATUS_CFG.PENDING;

  const handleAction = async (status: "VERIFIED" | "REJECTED") => {
    if (status === "REJECTED" && !notes.trim()) {
      toast.error("Please add a reason for rejection");
      return;
    }
    setLoading(status);
    const res = await verifyPaymentAction(payment._id, {
      status,
      verificationNotes: notes.trim() || undefined,
    });
    setLoading(null);
    if (res.success) {
      toast.success(
        status === "VERIFIED"
          ? "Payment verified — order confirmed, OTP sent to customer"
          : "Payment rejected — customer can resubmit"
      );
      onSuccess(order._id);
      onOpenChange(false);
    } else {
      toast.error(res.message ?? "Action failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Payment</DialogTitle>
          <DialogDescription>
            Verify to confirm the order and generate OTP, or reject to ask for
            resubmission.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Badge
            className={cn(
              "self-start gap-1 border font-medium px-2 py-0.5 text-xs",
              cfg.color
            )}
          >
            <PayIcon status={payment.status} size={11} />
            {cfg.label}
          </Badge>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-muted-foreground mb-1">Customer</p>
              <p className="text-sm font-semibold">{user?.fullName ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-xl font-bold">
                Rs. {payment.amount.toLocaleString()}
              </p>
              {payment.paymentMethod && (
                <p className="text-xs text-muted-foreground">
                  {payment.paymentMethod}
                </p>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium mb-1">Order</p>
            <p className="text-xs font-mono text-amber-800">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Pickup: {fmtDate(order.pickupDate)} at {order.pickupTime}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-slate-600">
              Payment Receipt
            </p>
            {receiptSrc ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={receiptSrc}
                  alt="Payment receipt"
                  className="w-full max-h-72 object-contain"
                />
                <a
                  href={receiptSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-white/90 rounded-lg px-2 py-1 hover:bg-white shadow-sm"
                >
                  <ExternalLink size={11} />
                  Open full
                </a>
              </div>
            ) : (
              <div className="h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                No receipt image
              </div>
            )}
          </div>
          {payment.notes && (
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-muted-foreground mb-1">
                Customer Notes
              </p>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Submitted: {fmtDateTime(payment.submittedAt || payment.createdAt)}
          </p>
          {payment.status !== "PENDING" && (
            <div
              className={cn(
                "p-3 rounded-xl border",
                payment.status === "VERIFIED"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}
            >
              <p className="text-xs font-semibold">
                {payment.status === "VERIFIED" ? "✓ Verified" : "✗ Rejected"}
                {payment.verifiedAt
                  ? ` · ${fmtDateTime(payment.verifiedAt)}`
                  : ""}
              </p>
              {payment.verificationNotes && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {payment.verificationNotes}
                </p>
              )}
            </div>
          )}
          {payment.status === "PENDING" && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (required for rejection)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add verification notes…"
                  rows={2}
                  className="rounded-xl resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleAction("REJECTED")}
                  disabled={!!loading}
                  variant="outline"
                  className="h-11 rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-semibold gap-2"
                >
                  {loading === "REJECTED" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleAction("VERIFIED")}
                  disabled={!!loading}
                  className="h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                >
                  {loading === "VERIFIED" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Verify
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPaymentsPage() {
  const { selectedStore, stores } = useStore();
  const [localStore, setLocalStore] = useState<StoreOption | null>(null);
  const [rows, setRows] = useState<OrderWithPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "VERIFIED" | "ALL"
  >("PENDING");
  const [selected, setSelected] = useState<OrderWithPayment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedStore) setLocalStore(selectedStore);
  }, [selectedStore]);

  const storeIdRef = useRef<string>("");
  storeIdRef.current = localStore?._id ?? "";

  const load = async (storeId: string) => {
    if (!storeId) return;
    setLoading(true);
    const ordersRes = await fetchStoreOrders(storeId);
    if (!ordersRes.success) {
      toast.error(ordersRes.message);
      setLoading(false);
      return;
    }
    const allOrders: Order[] = ordersRes.data ?? [];
    const settled = await Promise.allSettled(
      allOrders.map((o) => fetchOrderPayment(o._id))
    );
    const combined: OrderWithPayment[] = [];
    allOrders.forEach((order, i) => {
      const result = settled[i];
      const payment =
        result.status === "fulfilled" && result.value.success
          ? result.value.data ?? null
          : null;
      if (payment) combined.push({ order, payment });
    });
    setRows(combined);
    setLoading(false);
  };

  useEffect(() => {
    const id = localStore?._id ?? "";
    setRows([]);
    if (id) load(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStore?._id]);

  const handleRefresh = () => load(storeIdRef.current);

  const handleVerifySuccess = async (orderId: string) => {
    const res = await fetchOrderPayment(orderId);
    if (res.success && res.data) {
      setRows((prev) =>
        prev.map((r) =>
          r.order._id === orderId ? { ...r, payment: res.data } : r
        )
      );
    } else {
      setRows((prev) => prev.filter((r) => r.order._id !== orderId));
    }
  };

  const filtered = rows.filter((r) => {
    const user =
      typeof r.order.userId === "object" ? (r.order.userId as OrderUser) : null;
    const matchSearch =
      !search ||
      user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.order._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && r.payment.status === "PENDING") ||
      (statusFilter === "VERIFIED" && r.payment.status === "VERIFIED");
    return matchSearch && matchStatus;
  });

  const pendingCount = rows.filter(
    (r) => r.payment.status === "PENDING"
  ).length;
  const verifiedCount = rows.filter(
    (r) => r.payment.status === "VERIFIED"
  ).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {localStore
              ? `Verifying receipts for ${localStore.storeName}`
              : "Select a store to view payments"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={localStore?._id ?? ""}
            onValueChange={(v) => {
              const s = stores?.find((s: StoreOption) => s._id === v) ?? null;
              setLocalStore(s);
            }}
          >
            <SelectTrigger className="w-48 h-9 rounded-xl border-slate-200 gap-2">
              <Store size={13} className="text-slate-400 flex-shrink-0" />
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {stores?.map((s: StoreOption) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={loading || !localStore}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["PENDING", "VERIFIED", "ALL"] as const).map((s) => {
          const count =
            s === "PENDING"
              ? pendingCount
              : s === "VERIFIED"
              ? verifiedCount
              : rows.length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                statusFilter === s
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-amber-200"
              )}
            >
              {s === "PENDING" && <Clock size={11} />}
              {s === "VERIFIED" && <CheckCircle2 size={11} />}
              {s === "PENDING"
                ? "Awaiting Verification"
                : s === "VERIFIED"
                ? "Verified"
                : "All"}
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0 rounded-full text-[10px] font-bold",
                  statusFilter === s
                    ? "bg-amber-200 text-amber-800"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9 h-9 rounded-xl border-slate-200"
        />
      </div>

      {!localStore && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
          <Store size={40} className="text-slate-300" />
          <p className="text-sm">Select a store above to view payments.</p>
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
        localStore &&
        (filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
            <CreditCard size={40} className="text-slate-300" />
            <p className="text-sm">
              {statusFilter === "PENDING"
                ? "No payments awaiting verification."
                : "No payments found."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => {
              const { order, payment } = item;
              const user =
                typeof order.userId === "object"
                  ? (order.userId as OrderUser)
                  : null;
              const receiptSrc = resolveReceipt(payment.receiptImage);
              const cfg =
                PAY_STATUS_CFG[payment.status] ?? PAY_STATUS_CFG.PENDING;
              return (
                <button
                  key={order._id}
                  onClick={() => {
                    setSelected(item);
                    setDialogOpen(true);
                  }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all text-left w-full"
                >
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    {receiptSrc ? (
                      <img
                        src={receiptSrc}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CreditCard size={16} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {user?.fullName ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 border gap-1 font-medium",
                          cfg.color
                        )}
                      >
                        <PayIcon status={payment.status} size={10} />
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-semibold text-slate-700">
                        Rs. {payment.amount.toLocaleString()}
                      </span>
                      {payment.paymentMethod && ` · ${payment.paymentMethod}`}
                      {` · Order #${order._id.slice(-8).toUpperCase()}`}
                      {` · ${fmtDate(payment.createdAt)}`}
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

      <VerifyDialog
        item={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleVerifySuccess}
      />
    </div>
  );
}
