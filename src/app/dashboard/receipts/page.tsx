import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import PrintSlipButton from "@/components/PrintSlipButton";
import AdvanceStatusButton from "@/components/AdvanceStatusButton";
import { validateReceipt } from "@/app/actions";
import { ClipboardList, Plus } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const whereClause: any = {
    documentType: "Receipt",
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

  const receipts = await prisma.stockMove.findMany({
    where: whereClause,
    include: { product: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-indigo-600" /> Incoming Receipts
          </h1>
          <p className="text-slate-500 mt-1">
            Receive vendor goods, advance status, print PO slips & increment stock
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search Ref, Supplier, SKU..." />
          <Link
            href="/dashboard/receipts/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Receipt
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Supplier / Vendor</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Destination</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipts.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {r.reference || "REC-AUTO"}
                  <div className="text-xs font-normal text-slate-400">
                    {r.date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-800">{r.partner || "Direct Vendor"}</div>
                  {r.responsible && (
                    <div className="text-[11px] text-slate-400">By: {r.responsible}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800">
                  <span className="font-medium">{r.product.name}</span>
                  <span className="text-xs font-mono text-slate-400 block">{r.product.sku}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {r.toLocation?.name || "Main Warehouse"}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                  +{r.quantity} {r.product.uom}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <PrintSlipButton
                      title="Incoming Goods Receipt Slip"
                      reference={r.reference || r.id.slice(0, 8)}
                      date={r.date.toLocaleDateString("en-IN")}
                      partner={r.partner || undefined}
                      productName={r.product.name}
                      sku={r.product.sku}
                      quantity={r.quantity}
                      uom={r.product.uom}
                      locationName={r.toLocation?.name}
                      responsible={r.responsible || undefined}
                      type="Receipt"
                    />

                    {r.status === "Draft" && (
                      <AdvanceStatusButton id={r.id} nextStatus="Waiting" label="To Waiting" />
                    )}

                    {r.status === "Waiting" && (
                      <AdvanceStatusButton id={r.id} nextStatus="Ready" label="Mark Ready" />
                    )}

                    {r.status === "Ready" && (
                      <>
                        <ValidateButton action={validateReceipt} id={r.id} label="Validate & Add Stock" />
                        <CancelButton id={r.id} returnPath="/dashboard/receipts" />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  No receipts found. Click 'New Receipt' to record incoming supplier goods.
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
