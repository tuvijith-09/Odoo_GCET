import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import { validateDelivery } from "@/app/actions";
import { Truck } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const deliveries = await prisma.stockMove.findMany({
    where: { 
      documentType: "Delivery",
      ...(q ? {
        OR: [
          { reference: { contains: q } },
          { product: { name: { contains: q } } },
          { product: { sku: { contains: q } } }
        ]
      } : {})
    },
    include: { product: true, fromLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Delivery Orders</h1>
          <p className="text-slate-500 mt-1">Manage outgoing shipments to customers</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search Ref, Product, SKU..." />
          <Link
            href="/dashboard/deliveries/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Truck size={18} /> New Delivery
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{d.reference || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{d.product.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.fromLocation?.name || "—"}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right">{d.quantity}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {d.status === "Ready" && (
                    <div className="flex gap-2 justify-end">
                      <ValidateButton action={validateDelivery} id={d.id} />
                      <CancelButton id={d.id} returnPath="/dashboard/deliveries" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">No delivery orders found</td></tr>
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
    Canceled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
