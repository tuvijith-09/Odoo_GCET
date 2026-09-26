"use client";

import { useState } from "react";
import { LayoutList, Columns3, Search, ArrowRight, Package } from "lucide-react";

interface MoveItem {
  id: string;
  reference: string | null;
  documentType: string;
  status: string;
  quantity: number;
  date: string;
  product: {
    name: string;
    sku: string;
    uom: string;
  };
  fromLocation: { name: string } | null;
  toLocation: { name: string } | null;
}

export default function MoveHistoryView({ moves }: { moves: MoveItem[] }) {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredMoves = moves.filter((m) => {
    const matchesSearch =
      !searchTerm ||
      m.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" || m.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const statuses = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, product, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Operations</option>
            <option value="Receipt">Receipts</option>
            <option value="Delivery">Deliveries</option>
            <option value="Internal">Internal Transfers</option>
            <option value="Adjustment">Adjustments</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === "list"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutList size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === "kanban"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns3 size={14} /> Kanban View
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 font-medium">Date & Time</th>
                <th className="px-6 py-3 font-medium">Doc Type</th>
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Route / Location</th>
                <th className="px-6 py-3 font-medium text-right">Quantity</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMoves.map((move) => {
                const route =
                  move.documentType === "Receipt"
                    ? `Vendor → ${move.toLocation?.name || "Warehouse"}`
                    : move.documentType === "Delivery"
                    ? `${move.fromLocation?.name || "Warehouse"} → Customer`
                    : move.documentType === "Adjustment"
                    ? (move.fromLocation || move.toLocation)?.name || "Warehouse"
                    : `${move.fromLocation?.name || "Source"} → ${move.toLocation?.name || "Dest"}`;

                return (
                  <tr key={move.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">
                      {new Date(move.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          move.documentType === "Receipt"
                            ? "bg-green-50 text-green-700"
                            : move.documentType === "Delivery"
                            ? "bg-orange-50 text-orange-700"
                            : move.documentType === "Adjustment"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {move.documentType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-800">
                      {move.reference || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-800">
                      <span className="font-medium">{move.product.name}</span>
                      <span className="text-xs font-mono text-slate-400 block">{move.product.sku}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">{route}</td>
                    <td className="px-6 py-3.5 text-sm font-bold text-slate-800 text-right">
                      {move.quantity} {move.product.uom}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={move.status} />
                    </td>
                  </tr>
                );
              })}
              {filteredMoves.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    No movements match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {statuses.map((statusName) => {
            const statusMoves = filteredMoves.filter((m) => m.status === statusName);
            return (
              <div
                key={statusName}
                className="bg-slate-100/80 rounded-xl p-3 flex flex-col space-y-3 min-w-[240px] border border-slate-200"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {statusName}
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                    {statusMoves.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {statusMoves.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            m.documentType === "Receipt"
                              ? "bg-green-50 text-green-700"
                              : m.documentType === "Delivery"
                              ? "bg-orange-50 text-orange-700"
                              : m.documentType === "Adjustment"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {m.documentType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(m.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {m.reference || "Untitled Move"}
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {m.product.name}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">{m.product.sku}</span>
                        <span className="font-extrabold text-slate-900">
                          {m.quantity} {m.product.uom}
                        </span>
                      </div>
                    </div>
                  ))}
                  {statusMoves.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No {statusName.toLowerCase()} moves
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Done: "bg-emerald-100 text-emerald-700",
    Ready: "bg-blue-100 text-blue-700",
    Waiting: "bg-amber-100 text-amber-700",
    Draft: "bg-slate-100 text-slate-600",
    Canceled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
