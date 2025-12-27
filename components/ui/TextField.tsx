"use client";

import React, { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function TextField({ label, error, className = "", ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-black">{label}</label>}
      <input
        className={`w-full border border-black text-black px-4 py-3 rounded placeholder-black focus:outline-none focus:ring-2 focus:ring-yellow-500 ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
