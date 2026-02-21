"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./_components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="relative min-h-screen white">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <main
        className="min-h-screen p-4 sm:p-6 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? "72px" : "256px",
        }}
      >
        <div className="h-14 md:hidden" />

        {children}
      </main>
    </div>
  );
}
