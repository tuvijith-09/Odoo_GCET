import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const moves = await prisma.stockMove.findMany({
    include: { product: true, fromLocation: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Move History</h1>
        <p className="text-slate-500 mt-1">
          Complete audit trail of all inventory movements
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 font-medium">Document</th>
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">From</th>
              <th className="px-6 py-3 font-medium">To</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {moves.map((move) => (
              <tr
                key={move.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-3 text-sm text-slate-500">
                  {move.date.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      move.documentType === "Receipt"
                        ? "bg-green-50 text-green-700"
                        : move.documentType === "Delivery"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {move.documentType}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-slate-600">
                  {move.reference || "—"}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-slate-800">
                  {move.product.name}
                </td>
                <td className="px-6 py-3 text-sm text-slate-400">
                  {move.fromLocation?.name || "—"}
                </td>
                <td className="px-6 py-3 text-sm text-slate-400">
                  {move.toLocation?.name || "—"}
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-slate-800 text-right">
                  {move.quantity}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={move.status} />
                </td>
              </tr>
            ))}
            {moves.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-slate-400"
                >
                  No movements recorded yet
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
    Canceled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
