import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import { validateInternalTransfer } from "@/app/actions";
import { ArrowLeftRight, Plus, ArrowRight } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const whereClause: any = {
    documentType: "Internal",
  };

  if (q) {
    whereClause.OR = [
      { reference: { contains: q } },
      { product: { name: { contains: q } } },
      { product: { sku: { contains: q } } },
    ];
  }

  if (status && status !== "All") {
    whereClause.status = status;
  }

  const transfers = await prisma.stockMove.findMany({
    where: whereClause,
    include: { product: true, fromLocation: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ArrowLeftRight className="text-indigo-600" /> Internal Transfers
          </h1>
          <p className="text-slate-500 mt-1">
            Move inventory between racks, aisles, production areas, and warehouses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search Ref, Product, SKU..." />
          <Link
            href="/dashboard/transfers/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Transfer
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Transfer Route</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {t.reference || "INT-TRANSFER"}
                  <div className="text-xs font-normal text-slate-400">
                    {t.date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-800">
                  <span className="font-medium">{t.product.name}</span>
                  <span className="text-xs font-mono text-slate-400 block">{t.product.sku}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">
                      {t.fromLocation?.name || "Main Store"}
                    </span>
                    <ArrowRight size={13} className="text-indigo-500" />
                    <span className="font-medium text-slate-700">
                      {t.toLocation?.name || "Production Rack"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                  {t.quantity} {t.product.uom}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === "Ready" && (
                    <div className="flex gap-2 justify-end">
                      <ValidateButton
                        action={validateInternalTransfer}
                        id={t.id}
                        label="Validate Transfer"
                      />
                      <CancelButton id={t.id} returnPath="/dashboard/transfers" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  No internal transfers found. Click 'New Transfer' to move inventory between locations.
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
