import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";
import CancelButton from "@/components/CancelButton";
import { validateReceipt } from "@/app/actions";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const receipts = await prisma.stockMove.findMany({
    where: { documentType: "Receipt" },
    include: { product: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Receipts</h1>
          <p className="text-slate-500 mt-1">Manage incoming goods from suppliers</p>
        </div>
        <Link
          href="/dashboard/receipts/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200"
        >
          <ClipboardList size={18} /> New Receipt
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Date</th>
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
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{r.reference || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{r.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{r.product.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{r.toLocation?.name || "—"}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right">{r.quantity}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {r.status === "Ready" && (
                    <div className="flex gap-2 justify-end">
                      <ValidateButton action={validateReceipt} id={r.id} />
                      <CancelButton id={r.id} returnPath="/dashboard/receipts" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">No receipts yet</td></tr>
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
