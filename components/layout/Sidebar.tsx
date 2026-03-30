"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Building2,
  BookOpen,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
  { href: "/hubs", label: "Hub-wise Report", icon: MapPin },
  { href: "/brands", label: "Brand / Distributor", icon: Building2 },
  { href: "/ledger", label: "Petty Cash Ledger", icon: BookOpen },
  { href: "/risk-flags", label: "Risk Flags", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ backgroundColor: "#1F3864" }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-sm">Priyoshop</span>
            <span className="text-blue-300 text-xs">Operations Dashboard</span>
          </div>
        )}
        {collapsed && (
          <span className="text-white font-bold text-lg mx-auto">P</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors duration-150 group",
                active
                  ? "bg-white/20 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0",
                  active ? "text-white" : "text-blue-300 group-hover:text-white"
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-white/10 text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
