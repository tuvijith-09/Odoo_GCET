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
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Products", href: "/dashboard/products", icon: PackagePlus },
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
];

const reportItems = [
  { label: "Move History", href: "/dashboard/history", icon: History },
  { label: "Stock Report", href: "/dashboard/stock", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <span className="text-white text-xl font-bold tracking-tight">
          StockSense
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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

        <div className="pt-5 pb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
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

        <div className="pt-5 pb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Reports & Config
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

      <div className="p-3 border-t border-slate-800">
        <a
          href="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-red-600/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </a>
      </div>
    </div>
  );
}
