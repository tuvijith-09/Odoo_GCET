import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import PrintSlipButton from "@/components/PrintSlipButton";
import AdvanceStatusButton from "@/components/AdvanceStatusButton";
import PickPackButtons from "@/components/PickPackButtons";
import { validateDelivery } from "@/app/actions";
import { Truck, Plus } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const whereClause: any = {
    documentType: "Delivery",
  };

  if (q) {
    whereClause.OR = [
      { reference: { contains: q } },
      { partner: { contains: q } },
      { product: { name: { contains: q } } },
      { product: { sku: { contains: q } } },
    ];
  }

  if (status && status !== "All") {
    whereClause.status = status;
  }

  const deliveries = await prisma.stockMove.findMany({
    where: whereClause,
    include: { product: true, fromLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Truck className="text-indigo-600" /> Delivery Orders
          </h1>
          <p className="text-slate-500 mt-1">
            Pick items, pack shipments, print delivery notes & dispatch stock to customers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search Ref, Customer, SKU..." />
          <Link
            href="/dashboard/deliveries/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Delivery
          </Link>
        </div>
      </div>

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
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {d.reference || "SO-AUTO"}
                  <div className="text-xs font-normal text-slate-400">
                    {d.date.toLocaleDateString("en-IN", {
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
                      date={d.date.toLocaleDateString("en-IN")}
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
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                  No delivery orders found. Click 'New Delivery' to fulfill customer shipments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
