"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Store,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchStoreOrders } from "@/lib/actions/admin/order-action";
import { handleGetProductsByStore } from "@/lib/actions/public-action";
import { handleGetAllProducts } from "@/lib/actions/admin/product-action";
import { handleGetUsers } from "@/lib/actions/admin/user-action";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Order {
  _id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "READY_FOR_COLLECTION"
    | "COLLECTED"
    | "CANCELLED";
  paymentStatus: "PENDING" | "VERIFIED" | "FAILED";
  totalAmount: number;
  createdAt: string;
  userId: { fullName: string; email: string } | string;
}
interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}
interface User {
  _id: string;
  fullName: string;
  createdAt: string;
}

function fmtCurrency(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}
function daysAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// Stat Card
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center",
            color
          )}
        >
          <Icon size={16} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </p>
      )}
      {sub && !loading && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// Mini bar
function MiniBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-32 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">
        {value}
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { selectedStore, stores } = useStore();
  const [localStore, setLocalStore] = useState<{
    _id: string;
    storeName: string;
  } | null>(null);

  useEffect(() => {
    if (selectedStore) setLocalStore(selectedStore);
  }, [selectedStore]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const storeIdRef = useRef("");
  storeIdRef.current = localStore?._id ?? "";

  const load = async (storeId: string) => {
    setLoading(true);
    const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
      storeId
        ? fetchStoreOrders(storeId)
        : Promise.resolve({ success: true as const, data: [] }),
      storeId ? handleGetProductsByStore(storeId) : handleGetAllProducts(),
      handleGetUsers(),
    ]);

    if (ordersRes.status === "fulfilled" && ordersRes.value.success)
      setOrders(ordersRes.value.data ?? []);
    if (productsRes.status === "fulfilled" && productsRes.value.success)
      setProducts(productsRes.value.data ?? []);
    if (usersRes.status === "fulfilled" && usersRes.value.success)
      setUsers(usersRes.value.data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    const id = localStore?._id ?? "";
    setOrders([]);
    setProducts([]);
    setUsers([]);
    load(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStore?._id]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "VERIFIED")
    .reduce((s, o) => s + o.totalAmount, 0);

  const pendingRevenue = orders
    .filter((o) => o.paymentStatus === "PENDING" && o.status !== "CANCELLED")
    .reduce((s, o) => s + o.totalAmount, 0);

  const ordersByStatus = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    READY_FOR_COLLECTION: orders.filter(
      (o) => o.status === "READY_FOR_COLLECTION"
    ).length,
    COLLECTED: orders.filter((o) => o.status === "COLLECTED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const paymentsPending = orders.filter(
    (o) => o.paymentStatus === "PENDING" && o.status !== "CANCELLED"
  ).length;
  const paymentsVerified = orders.filter(
    (o) => o.paymentStatus === "VERIFIED"
  ).length;
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5);
  const outOfStock = products.filter((p) => p.quantity === 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: orders.filter((o) => new Date(o.createdAt).toDateString() === key)
        .length,
    };
  });
  const maxDay = Math.max(...last7.map((d) => d.count), 1);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    READY_FOR_COLLECTION: "bg-purple-50 text-purple-700 border-purple-200",
    COLLECTED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    READY_FOR_COLLECTION: "Ready",
    COLLECTED: "Collected",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {localStore ? localStore.storeName : "All stores"} ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={localStore?._id ?? "ALL"}
            onValueChange={(v) => {
              if (v === "ALL") {
                setLocalStore(null);
                return;
              }
              const s =
                stores?.find(
                  (s: { _id: string; storeName: string }) => s._id === v
                ) ?? null;
              setLocalStore(s);
            }}
          >
            <SelectTrigger className="w-48 h-9 rounded-xl border-slate-200 gap-2">
              <Store size={13} className="text-slate-400 flex-shrink-0" />
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {stores?.map((s: { _id: string; storeName: string }) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => load(storeIdRef.current)}
            disabled={loading}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          loading={loading}
          value={fmtCurrency(totalRevenue)}
          sub={`${fmtCurrency(pendingRevenue)} pending`}
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="Total Orders"
          loading={loading}
          value={orders.length}
          sub={`${ordersByStatus.PENDING} awaiting confirmation`}
          icon={ShoppingBag}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Payments Pending"
          loading={loading}
          value={paymentsPending}
          sub={`${paymentsVerified} verified`}
          icon={CreditCard}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Total Users"
          loading={loading}
          value={users.length}
          sub={`${stores?.length ?? 0} store${
            (stores?.length ?? 0) !== 1 ? "s" : ""
          }`}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Orders by Status
            </span>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <MiniBar
                label="Pending"
                value={ordersByStatus.PENDING}
                max={orders.length}
                color="bg-yellow-400"
              />
              <MiniBar
                label="Confirmed"
                value={ordersByStatus.CONFIRMED}
                max={orders.length}
                color="bg-blue-400"
              />
              <MiniBar
                label="Ready for Pickup"
                value={ordersByStatus.READY_FOR_COLLECTION}
                max={orders.length}
                color="bg-purple-400"
              />
              <MiniBar
                label="Collected"
                value={ordersByStatus.COLLECTED}
                max={orders.length}
                color="bg-green-400"
              />
              <MiniBar
                label="Cancelled"
                value={ordersByStatus.CANCELLED}
                max={orders.length}
                color="bg-red-400"
              />
            </div>
          )}
          {!loading && orders.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">
              No orders yet
            </p>
          )}
        </div>

        {/* 7-day bar chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Orders — Last 7 Days
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-24 mt-auto">
            {last7.map((d) => (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t-md bg-amber-100 relative overflow-hidden"
                  style={{ height: "80px" }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-amber-400 rounded-t-md transition-all"
                    style={{
                      height: loading ? "0%" : `${(d.count / maxDay) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 border-t border-slate-50 pt-2">
            <span>{last7.reduce((s, d) => s + d.count, 0)} this week</span>
            <span>
              peak:{" "}
              {maxDay === 1 && last7.every((d) => d.count === 0) ? 0 : maxDay}
            </span>
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Package size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Inventory Alerts
            </span>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : outOfStock.length === 0 && lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
              <CheckCircle2 size={28} className="text-green-400" />
              <p className="text-xs">All products in stock</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-44">
              {outOfStock.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100"
                >
                  <div className="flex items-center gap-2">
                    <XCircle size={13} className="text-red-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-red-800 truncate max-w-[140px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">
                    Out
                  </span>
                </div>
              ))}
              {lowStock.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-100"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      size={13}
                      className="text-orange-500 flex-shrink-0"
                    />
                    <span className="text-xs font-medium text-orange-800 truncate max-w-[140px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                    {p.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 border-t border-slate-50 pt-2">
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-slate-700">
                {products.length}
              </p>
              <p className="text-[10px] text-slate-400">Total</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-orange-500">
                {lowStock.length}
              </p>
              <p className="text-[10px] text-slate-400">Low Stock</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-red-500">
                {outOfStock.length}
              </p>
              <p className="text-[10px] text-slate-400">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Recent Orders
            </span>
          </div>
          <span className="text-xs text-slate-400">{orders.length} total</span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <ShoppingBag size={32} className="text-slate-200" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {recentOrders.map((order) => {
              const user =
                typeof order.userId === "object" ? order.userId : null;
              return (
                <div
                  key={order._id}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={13} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {user?.fullName ?? "Customer"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      statusColor[order.status]
                    )}
                  >
                    {statusLabel[order.status]}
                  </span>
                  <span className="text-sm font-bold text-slate-700 w-24 text-right">
                    {fmtCurrency(order.totalAmount)}
                  </span>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {daysAgo(order.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
