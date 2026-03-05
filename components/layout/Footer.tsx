import Link from "next/link";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Ease"
              width={40}
              height={26}
              className="h-auto"
            />
            <span className="text-sm text-slate-400">
              Your Store. Your Time. Zero Lines.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link
              href="/"
              className="hover:text-slate-800 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="hover:text-slate-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-slate-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Ease. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
