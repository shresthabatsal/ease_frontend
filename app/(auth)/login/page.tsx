"use client";

import LoginForm from "../_components/LoginForm";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/ease_logo.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src={logo}
              alt="Ease"
              width={52}
              height={34}
              className="h-auto"
            />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your Ease account
            </p>
          </div>
          <div className="px-8 pb-8 pt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
