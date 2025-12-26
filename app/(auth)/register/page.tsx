import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";
import Header from "@/app/(public)/_components/Header";

export default function Page() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        {/* Register Box */}
        <div className="bg-gray-100 p-14 rounded-lg w-200 flex flex-col items-center gap-4">
          {/* Logo */}
          <Image src={logo} alt="Logo" width={40} className="mb-2" />

          {/* Welcome Message */}
          <h1 className="text-2xl font-bold text-black">Get Started</h1>
          <p className="text-black text-sm text-center">
            Join now to start shopping with Ease.
          </p>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
