"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { LayoutDashboard, Users, Menu } from "lucide-react";
import logo from "@/app/assets/images/ease_logo.png";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoverLogo, setHoverLogo] = useState(false);

  const isDashboardActive = pathname === "/admin";
  const isUsersActive = pathname.startsWith("/admin/users");

  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin",
      active: isDashboardActive,
    },
    {
      name: "Users",
      icon: <Users size={20} />,
      href: "/admin/users",
      active: isUsersActive,
    },
  ];

  const linkClass = (active: boolean) =>
    `relative flex items-center ${
      collapsed ? "justify-center" : "gap-3"
    } px-4 py-3 w-full text-black hover:bg-yellow-50 ${
      active ? "font-bold" : "font-normal"
    }`;

  return (
    <aside
      className={`min-h-screen bg-white border-r transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo row */}
      <div
        className={`p-4 ${
          collapsed
            ? "flex flex-col items-center"
            : "flex flex-row justify-between items-center"
        }`}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            {collapsed && hoverLogo ? (
              <button onClick={() => setCollapsed(false)}>
                <Menu color="black"/>
              </button>
            ) : (
              <Image
                src={logo}
                alt="Ease Logo"
                width={36}
                height={36}
                className="align-middle"
              />
            )}
          </div>

          {!collapsed && (
            <span className="font-bold text-lg text-black leading-none">
              Ease
            </span>
          )}
        </div>

        {/* Icon */}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}>
            <Menu size={24} color="black"/>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col items-stretch">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.active)}
          >
            {item.active && (
              <span className="absolute left-0 top-0 h-full w-1 bg-[#F6B60D]" />
            )}
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
