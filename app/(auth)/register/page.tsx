"use client";

import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";
import logo from "@/app/assets/images/ease_logo.png";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <Image src={logo} alt="Logo" width={40} />
          <CardTitle className="text-2xl">Get Started</CardTitle>
          <CardDescription>
            Join now to start shopping with Ease.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
