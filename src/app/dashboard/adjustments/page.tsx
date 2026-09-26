import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SlidersHorizontal, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";

export default async function AdjustmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const adjustments = await prisma.stockMove.findMany({
    where: {
      documentType: "Adjustment",
      ...(q
        ? {
            OR: [
              { reference: { contains: q } },
              { product: { name: { contains: q } } },
              { product: { sku: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      product: true,
      fromLocation: true,
      toLocation: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SlidersHorizontal className="text-indigo-600" /> Inventory Adjustments
          </h1>
          <p className="text-slate-500 mt-1">
            Reconcile physical counts with system stock records (damages, shrinkage, inventory audits)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search Product, SKU, Ref..." />
          <Link
            href="/dashboard/adjustments/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Adjustment
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Reference / Reason</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium text-right">Adjustment Qty</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adjustments.map((adj) => {
              const isNegative = !!adj.fromLocationId;
              const location = adj.fromLocation || adj.toLocation;
              return (
                <tr key={adj.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {adj.date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {adj.reference || "Physical Count Mismatch"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {adj.product.name}{" "}
                    <span className="font-mono text-xs font-normal text-slate-400">
                      ({adj.product.sku})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {location?.name || "Main Warehouse"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isNegative ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isNegative ? (
                        <>
                          <ArrowDownRight size={16} /> -{adj.quantity} {adj.product.uom}
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={16} /> +{adj.quantity} {adj.product.uom}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                      Done
                    </span>
                  </td>
                </tr>
              );
            })}
            {adjustments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <RefreshCcw className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="font-medium text-slate-600">No stock adjustments recorded yet</p>
                    <p className="text-xs text-slate-400">
                      Create an adjustment whenever a physical count differs from recorded warehouse inventory.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
