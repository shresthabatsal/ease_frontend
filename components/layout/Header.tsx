"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/app/assets/images/ease_logo.png";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";

const IMAGE_BASE_URL = "http://localhost:5050";

function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
}

export default function Header() {
  const { isAuthenticated, isAdmin, logout, user, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const [logoutDialog, setLogoutDialog] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const avatarSrc = getImageUrl(user?.profilePictureUrl);

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 bg-white border-b border-slate-100 shadow-sm">
        {/* Logo */}
        <Link href="/">
          <Image src={logo} alt="Logo" width={50} height={30} />
        </Link>

        {!isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button
                size="sm"
                className="bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none rounded-xl px-4"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl px-4"
              >
                Sign up
              </Button>
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Avatar */}
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
      </header>
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="rounded-xl sm:max-w-sm">
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
    </>
  );
}
