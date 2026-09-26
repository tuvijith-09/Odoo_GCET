"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Truck,
  LayoutDashboard,
  Settings,
  History,
  ClipboardList,
  PackagePlus,
  ArrowLeftRight,
  LogOut,
  BarChart3,
  Warehouse,
  ChevronRight,
  SlidersHorizontal,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Products", href: "/dashboard/products", icon: PackagePlus },
  { label: "Stock Availability", href: "/dashboard/stock", icon: BarChart3 },
  { label: "Warehouses", href: "/dashboard/warehouses", icon: Warehouse },
];

const operationItems = [
  { label: "Receipts", href: "/dashboard/receipts", icon: ClipboardList },
  { label: "Delivery Orders", href: "/dashboard/deliveries", icon: Truck },
  {
    label: "Internal Transfers",
    href: "/dashboard/transfers",
    icon: ArrowLeftRight,
  },
  {
    label: "Inventory Adjustment",
    href: "/dashboard/adjustments",
    icon: SlidersHorizontal,
  },
];

const reportItems = [
  { label: "Move History", href: "/dashboard/history", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-xl shadow-md shadow-indigo-900/50">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="text-white text-lg font-bold tracking-tight block">
            StockSense
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Modular IMS
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Main
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}

        <div className="pt-5 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Operations
        </div>
        {operationItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}

        <div className="pt-5 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Audit & Config
        </div>
        {reportItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            pathname === "/dashboard/profile"
              ? "bg-indigo-600/30 text-indigo-300 font-medium"
              : "hover:bg-slate-800 hover:text-white text-slate-400"
          }`}
        >
          <User size={18} />
          My Profile
        </Link>
        <a
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
        >
          <LogOut size={18} />
          Logout
        </a>
      </div>
    </aside>
  );
}
