"use client";

import { useState } from "react";
import { LayoutList, Columns3, Search } from "lucide-react";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import PrintSlipButton from "@/components/PrintSlipButton";
import AdvanceStatusButton from "@/components/AdvanceStatusButton";
import PickPackButtons from "@/components/PickPackButtons";
import { validateDelivery } from "@/app/actions";

interface DeliveryItem {
  id: string;
  reference: string | null;
  partner: string | null;
  responsible: string | null;
  quantity: number;
  status: string;
  date: string;
  isPicked: boolean;
  isPacked: boolean;
  product: {
    name: string;
    sku: string;
    uom: string;
  };
  fromLocation: {
    name: string;
  } | null;
}

export default function DeliveriesView({ deliveries }: { deliveries: DeliveryItem[] }) {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = deliveries.filter((d) => {
    const matchesSearch =
      !searchTerm ||
      d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.partner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

  return (
    <div className="space-y-4">
      {/* Search & Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, reference, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>

          {/* List vs Kanban Toggle */}
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
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Customer / Client</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium text-right">Qty</th>
                <th className="px-6 py-3 font-medium">Pick & Pack</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {d.reference || "SO-AUTO"}
                    <div className="text-xs font-normal text-slate-400">
                      {new Date(d.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-800">{d.partner || "Direct Customer"}</div>
                    {d.responsible && (
                      <div className="text-[11px] text-slate-400">By: {d.responsible}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    <span className="font-medium">{d.product.name}</span>
                    <span className="text-xs font-mono text-slate-400 block">{d.product.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {d.fromLocation?.name || "Main Warehouse"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                    -{d.quantity} {d.product.uom}
                  </td>
                  <td className="px-6 py-4">
                    <PickPackButtons
                      id={d.id}
                      isPicked={d.isPicked}
                      isPacked={d.isPacked}
                      status={d.status}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <PrintSlipButton
                        title="Customer Delivery Note / Packing Slip"
                        reference={d.reference || d.id.slice(0, 8)}
                        date={new Date(d.date).toLocaleDateString("en-IN")}
                        partner={d.partner || undefined}
                        productName={d.product.name}
                        sku={d.product.sku}
                        quantity={d.quantity}
                        uom={d.product.uom}
                        locationName={d.fromLocation?.name}
                        responsible={d.responsible || undefined}
                        type="Delivery"
                      />

                      {d.status === "Draft" && (
                        <AdvanceStatusButton id={d.id} nextStatus="Waiting" label="To Waiting" />
                      )}

                      {d.status === "Waiting" && (!d.isPicked || !d.isPacked) && (
                        <span className="text-[11px] text-amber-600 font-medium">Pick & Pack first</span>
                      )}

                      {d.status === "Ready" && (
                        <>
                          <ValidateButton action={validateDelivery} id={d.id} label="Validate & Ship" />
                          <CancelButton id={d.id} returnPath="/dashboard/deliveries" />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    No delivery orders found matching your criteria.
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
            const statusDeliveries = filtered.filter((d) => d.status === statusName);
            return (
              <div
                key={statusName}
                className="bg-slate-100/80 rounded-xl p-3 flex flex-col space-y-3 min-w-[240px] border border-slate-200"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {statusName}
                  </span>
                  <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {statusDeliveries.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {statusDeliveries.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {d.reference || "SO"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(d.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700">{d.partner || "Customer"}</p>
                        <p className="text-xs text-slate-900 font-bold mt-0.5">{d.product.name}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">{d.product.sku}</span>
                        <span className="font-extrabold text-orange-700">
                          -{d.quantity} {d.product.uom}
                        </span>
                      </div>

                      {statusName === "Ready" && (
                        <div className="pt-2 border-t border-slate-100 flex justify-end gap-1">
                          <ValidateButton action={validateDelivery} id={d.id} label="Validate & Ship" />
                        </div>
                      )}
                    </div>
                  ))}
                  {statusDeliveries.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No {statusName.toLowerCase()} deliveries
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
