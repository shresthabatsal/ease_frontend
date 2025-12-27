"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";

type HeaderProps = {
  variant?: "auth" | "app";
};

export default function Header({ variant = "auth" }: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 py-5 bg-white shadow-md shadow-gray-400/20">
      {/* Left: Logo */}
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={30} />
      </Link>

      {/* Right Side */}
      {variant === "auth" ? (
        /* Auth Pages */
        <div className="flex gap-4">
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
        </div>
      ) : (
        /* App pages */
        <div className="flex items-center gap-4">
          {/* Placeholder Buttons */}
          <button className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition" />

          <button className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition" />

          <button className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition" />
        </div>
      )}
    </header>
  );
}
