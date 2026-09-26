"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

export default function DashboardFilters({
  locations,
  categories,
}: {
  locations: { id: string; name: string }[];
  categories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("docType") || "All";
  const currentStatus = searchParams.get("status") || "All";
  const currentLocation = searchParams.get("locationId") || "All";
  const currentCategory = searchParams.get("category") || "All";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    currentType !== "All" ||
    currentStatus !== "All" ||
    currentLocation !== "All" ||
    currentCategory !== "All";

  const clearAllFilters = () => {
    router.replace(pathname);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter size={14} className="text-indigo-600" /> Dynamic Ledger Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            <X size={13} /> Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Document Type Filter */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Document Type</label>
          <select
            value={currentType}
            onChange={(e) => handleFilterChange("docType", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Receipt">Receipt (Incoming)</option>
            <option value="Delivery">Delivery (Outgoing)</option>
            <option value="Internal">Internal Transfer</option>
            <option value="Adjustment">Stock Adjustment</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Ready">Ready</option>
            <option value="Waiting">Waiting</option>
            <option value="Draft">Draft</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* Warehouse / Location Filter */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Warehouse / Location</label>
          <select
            value={currentLocation}
            onChange={(e) => handleFilterChange("locationId", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Category Filter */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Product Category</label>
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
