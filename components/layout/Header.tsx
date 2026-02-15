"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";

type HeaderProps = {
  variant?: "auth" | "app";
};

export default function Header({ variant = "auth" }: HeaderProps) {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 py-5 bg-white shadow-md shadow-gray-400/20">
      {/* Left: Logo */}
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={30} />
      </Link>

      {/* Right Side */}
      {variant === "auth" ? (
        <div className="flex gap-4">
          {!isAuthenticated && (
            <>
              <Link href="/login">
                <Button className="px-4 py-1 bg-[#F6B60D] text-black rounded hover:bg-yellow-500 transition">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="px-4 py-1 border border-black text-black rounded hover:bg-gray-100 transition"
                >
                  Signup
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className="font-medium">{user?.name}</span>
              <Button
                onClick={logout}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* App buttons */}
          <Link href="/user/profile">
            <Button className="px-3 py-1 border rounded hover:bg-gray-100 transition">
              Profile
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <Button className="px-3 py-1 border rounded hover:bg-gray-100 transition">
                Admin Panel
              </Button>
            </Link>
          )}

          <Button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
