"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-5 bg-white shadow-md shadow-gray-400/20">
      {/* Left: Logo */}
      <div>
        <Link href="/">
          <Image src={logo} alt="Logo" width={50} height={30} />
        </Link>
      </div>

      {/* Right: Login & Signup */}
      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-4 py-1 border-1 border-[#F6B60D] bg-[#F6B60D] text-black rounded box-border hover:bg-yellow-500">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-4 py-1 border-1 border-black text-black rounded box-border hover:bg-gray-100">
            Signup
          </button>
        </Link>
      </div>
    </header>
  );
}
