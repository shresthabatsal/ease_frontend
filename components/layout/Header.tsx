"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/app/assets/images/ease_logo.png";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  LogOut,
  User,
  Search,
  ShoppingCart,
  ShoppingBag,
  Store,
  Map,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import StoreMapView from "@/components/StoreMapView";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
function resolveImg(path?: string) {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

export default function Header() {
  const { isAuthenticated, isAdmin, logout, user, checkAuth } = useAuth();
  const { stores, selectedStore, setSelectedStore, loadingStores } = useStore();
  const { itemCount: cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeMapOpen, setStoreMapOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const q = searchQuery.trim();
    if (!q || !selectedStore) return;
    router.push(
      `/search?q=${encodeURIComponent(q)}&storeId=${selectedStore._id}`
    );
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const avatarSrc = resolveImg(user?.profilePictureUrl);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="px-3 sm:px-6">
          {/* ── Top row ── */}
          <div className="flex items-center gap-2 sm:gap-3 h-14">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={logo}
                alt="Logo"
                width={54}
                height={34}
                className="w-[46px] h-auto sm:w-[54px]"
              />
            </Link>

            {/* Store selector + map button */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-0">
              {loadingStores ? (
                <div className="h-9 flex-1 sm:w-44 bg-slate-100 animate-pulse rounded-xl" />
              ) : (
                <Select
                  value={selectedStore?._id ?? ""}
                  onValueChange={(id) => {
                    const store = stores.find((s) => s._id === id);
                    if (store) setSelectedStore(store);
                  }}
                >
                  <SelectTrigger
                    className="h-9 flex-1 sm:w-44 sm:flex-none rounded-xl border-slate-200
                               text-sm font-semibold text-slate-700 focus:ring-amber-400 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                      <Store
                        size={13}
                        className="text-amber-500 flex-shrink-0"
                      />
                      <span className="truncate">
                        <SelectValue placeholder="Store" />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {stores.map((store) => (
                      <SelectItem
                        key={store._id}
                        value={store._id}
                        className="rounded-lg cursor-pointer"
                      >
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Map button */}
              <button
                onClick={() => setStoreMapOpen(true)}
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center
                           rounded-xl border border-slate-200 hover:border-amber-300
                           hover:bg-amber-50 transition-colors"
                title="Browse stores on map"
                aria-label="Open store map"
              >
                <Map size={14} className="text-slate-600" />
              </button>
            </div>

            {/* Search — desktop only */}
            <div className="relative hidden sm:flex flex-1 min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder={
                  selectedStore ? "Search in Ease" : "Select a store to search…"
                }
                disabled={!selectedStore}
                className="pl-8 h-9 w-full rounded-xl border-slate-200 text-sm focus-visible:ring-amber-400 disabled:opacity-50"
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Cart */}
              {isAuthenticated && (
                <button
                  onClick={() => router.push("/cart")}
                  className="relative h-9 w-9 flex items-center justify-center
                             rounded-xl border border-slate-200 hover:border-amber-300
                             hover:bg-amber-50 transition-colors"
                  aria-label="Cart"
                  title="Cart"
                >
                  <ShoppingCart size={16} className="text-slate-600" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#F6B60D]
                                     text-[10px] font-bold text-black flex items-center justify-center shadow"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Orders */}
              {isAuthenticated && (
                <button
                  onClick={() => router.push("/orders")}
                  className="h-9 w-9 flex items-center justify-center
                             rounded-xl border border-slate-200 hover:border-amber-300
                             hover:bg-amber-50 transition-colors"
                  aria-label="My Orders"
                  title="My Orders"
                >
                  <ShoppingBag size={16} className="text-slate-600" />
                </button>
              )}

              {isAuthenticated && <NotificationBell />}

              {!isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold
                                 shadow-none rounded-xl px-3 h-9 text-xs sm:px-4 sm:text-sm"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="hidden sm:block">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50
                                 font-semibold rounded-xl px-4 h-9"
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                      <Avatar className="h-9 w-9 ring-2 ring-amber-200 hover:ring-amber-400 transition-all cursor-pointer">
                        <AvatarImage src={avatarSrc} alt={user?.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-sm font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-xl shadow-lg border border-slate-100 p-1"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-slate-400 font-normal truncate">
                        {user?.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem
                      className="gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-slate-600 focus:bg-amber-50"
                      onClick={() => router.push("/profile")}
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-slate-600 focus:bg-amber-50"
                      onClick={() => router.push("/orders")}
                    >
                      <ShoppingBag size={15} />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        className="gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-slate-600 focus:bg-amber-50"
                        onClick={() => router.push("/admin")}
                      >
                        <LayoutDashboard size={15} />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem
                      className="gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-red-500 focus:bg-red-50"
                      onClick={() => setLogoutDialog(true)}
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* ── Row 2: search bar, mobile only ── */}
          <div className="flex sm:hidden pb-3">
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder={
                  selectedStore ? "Search in Ease" : "Select a store first…"
                }
                disabled={!selectedStore}
                className="pl-8 h-9 w-full rounded-xl border-slate-200 text-sm focus-visible:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </header>

      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="rounded-xl sm:max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account. You can log back in
              anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="flex-1 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StoreMapView open={storeMapOpen} onOpenChange={setStoreMapOpen} />
    </>
  );
}
