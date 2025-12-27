"use client";

import React, { ReactNode } from "react";
import Header from "../../components/layout/Header"; // header component

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <Header variant="app" />

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
