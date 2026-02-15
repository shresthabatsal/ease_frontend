"use client";

import LoginForm from "../_components/LoginForm";
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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <Image src={logo} alt="Logo" width={40} />
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to continue.</CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
