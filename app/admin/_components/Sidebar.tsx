"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import logo from "@/app/assets/images/ease_logo.png";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Products", icon: Package, href: "/admin/products" },
  { name: "Categories", icon: Tag, href: "/admin/categories" },
];

// Nav Link

function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        "hover:bg-amber-50 hover:text-amber-700",
        active
          ? "bg-amber-50 text-amber-700 shadow-sm"
          : "text-slate-500 hover:text-amber-700",
        collapsed && "justify-center px-2"
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#F6B60D]" />
      )}

      {/* Icon */}
      <span
        className={cn(
          "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
          active
            ? "text-[#F6B60D]"
            : "text-slate-400 group-hover:text-[#F6B60D]"
        )}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </span>

      {/* Label */}
      {!collapsed && <span className="truncate leading-none">{item.name}</span>}

      {/* Active chevron */}
      {!collapsed && active && (
        <ChevronRight size={14} className="ml-auto text-[#F6B60D] opacity-70" />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// Desktop

function DesktopSidebar({
  collapsed,
  setCollapsed,
  pathname,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden md:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-slate-100 shadow-sm z-20",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
              <Image src={logo} alt="Ease Logo" width={22} height={22} />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-bold text-base text-slate-800 tracking-tight">
                  Ease
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                  Admin
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              onClick={() => setCollapsed(true)}
            >
              <Menu size={16} />
            </Button>
          )}
        </div>

        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto mb-2 h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                onClick={() => setCollapsed(false)}
              >
                <ChevronRight size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        )}

        <Separator className="bg-slate-100" />

        {/* Nav section label */}
        {!collapsed && (
          <p className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
            Menu
          </p>
        )}

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={active}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "p-3 border-t border-slate-100",
            collapsed && "flex justify-center"
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-400 truncate">
                  admin@ease.com
                </p>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                  A
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Admin User</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Mobile Sidebar

function MobileSidebar({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-30 h-10 w-10 bg-white shadow-md border border-slate-200 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-600"
          >
            <Menu size={18} />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0 border-r border-slate-100"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                <Image src={logo} alt="Ease Logo" width={22} height={22} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-base text-slate-800 tracking-tight">
                  Ease
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                  Admin
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <p className="px-5 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
            Menu
          </p>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-3 py-2">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={false}
                  active={active}
                  onClick={() => setOpen(false)}
                />
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-400 truncate">
                  admin@ease.com
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pathname={pathname}
      />

      {/* Mobile */}
      <MobileSidebar pathname={pathname} />
    </>
  );
}
