"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "google";
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  let baseClasses =
    "w-full px-4 py-3 rounded font-medium transition disabled:opacity-60";

  let variantClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = "bg-yellow-500 text-black hover:bg-yellow-600";
      break;
    case "secondary":
      variantClasses = "border border-black text-black bg-white hover:bg-gray-100";
      break;
    case "google":
      variantClasses =
        "bg-white text-black border border-black hover:bg-gray-100 flex justify-center items-center gap-2";
      break;
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
