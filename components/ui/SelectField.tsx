"use client";

import React, { SelectHTMLAttributes } from "react";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
};

export default function SelectField({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[15px] font-medium text-black">{label}</label>
      )}

      <select
        className={`w-full border border-black text-black px-4 py-3 rounded bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
