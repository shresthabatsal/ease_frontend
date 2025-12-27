"use client";

import LoginForm from "../_components/LoginForm";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";

export default function Page() {
  return (
    <div className="bg-gray-100 p-14 rounded-lg flex flex-col items-center gap-4
                    w-full max-w-[90%] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
      <Image src={logo} alt="Logo" width={40} className="mb-2" />
      <h1 className="text-2xl font-bold text-black">Welcome Back!</h1>
      <p className="text-black text-sm text-center">Log in to continue.</p>
      <LoginForm />
    </div>
  );
}
