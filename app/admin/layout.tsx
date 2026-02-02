"use client";

import { useState } from "react";
import AdminSidebar from "./_components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <main
        className="min-h-screen p-6 transition-all duration-200"
        style={{ marginLeft: collapsed ? "5rem" : "16rem" }}
      >
        {children}
      </main>
    </div>
  );
}
