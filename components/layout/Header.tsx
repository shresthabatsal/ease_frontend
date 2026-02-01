"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";
import { useAuth } from "@/context/AuthContext";

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
                <button className="px-4 py-1 bg-[#F6B60D] text-black rounded hover:bg-yellow-500 transition">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-1 border border-black text-black rounded hover:bg-gray-100 transition">
                  Signup
                </button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className="font-medium">{user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* App buttons */}
          <Link href="/user/profile">
            <button className="px-3 py-1 border rounded hover:bg-gray-100 transition">
              Profile
            </button>
          </Link>

          {isAdmin && (
            <Link href="/admin/users">
              <button className="px-3 py-1 border rounded hover:bg-gray-100 transition">
                Admin Panel
              </button>
            </Link>
          )}

          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
