"use client";

import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";

export default function Page() {
  return (
    <div className="bg-gray-100 p-14 rounded-lg flex flex-col items-center gap-4
                    w-[500px] max-w-full sm:w-[500px] md:w-[600px] lg:w-[700px] xl:w-[800px]">
      <Image src={logo} alt="Logo" width={40} className="mb-2" />
      <h1 className="text-2xl font-bold text-black">Get Started</h1>
      <p className="text-black text-sm text-center">
        Join now to start shopping with Ease.
      </p>
      <RegisterForm />
    </div>
  );
}
