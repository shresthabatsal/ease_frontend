"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { LayoutDashboard, Users, Menu } from "lucide-react";
import logo from "@/app/assets/images/ease_logo.png";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [hoverLogo, setHoverLogo] = useState(false);

  const isDashboardActive = pathname === "/admin";
  const isUsersActive = pathname.startsWith("/admin/users");
  const isProductsActive = pathname.startsWith("/admin/products");
  const isCategoiesActive = pathname.startsWith("/admin/categories");

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
    {
      name: "Products",
      icon: <Users size={20} />,
      href: "/admin/products",
      active: isProductsActive,
    },
    {
      name: "Categories",
      icon: <Users size={20} />,
      href: "/admin/categories",
      active: isCategoiesActive,
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
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-300 transition-all duration-200 z-20 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo row */}
      <div
        className={`p-4 flex flex-row items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        {/* Logo / hover icon */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="flex items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            {collapsed && hoverLogo ? (
              <button onClick={() => setCollapsed(false)}>
                <Menu color="black" />
              </button>
            ) : (
              <Image
                src={logo}
                alt="Ease Logo"
                width={36}
                height={36}
                className="block"
              />
            )}
          </div>

          {!collapsed && (
            <span className="font-bold text-lg text-black leading-none flex items-center">
              Ease
            </span>
          )}
        </div>

        {/* Collapse icon in expanded mode */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center justify-center"
          >
            <Menu color="black" />
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
