import { prisma } from "@/lib/prisma";
import { BarChart3, AlertTriangle, Coins, PackageCheck, AlertOctagon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockReportPage() {
  const products = await prisma.product.findMany({
    include: { stockQuants: { include: { location: true } } },
    orderBy: { name: "asc" },
  });

  // Calculate pending outgoing quantities per product for "Free to Use" computation
  const pendingDeliveries = await prisma.stockMove.findMany({
    where: {
      documentType: "Delivery",
      status: { in: ["Waiting", "Ready"] },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  const reservedMap: Record<string, number> = {};
  for (const del of pendingDeliveries) {
    reservedMap[del.productId] = (reservedMap[del.productId] || 0) + del.quantity;
  }

  const report = products.map((p) => {
    const onHand = p.stockQuants.reduce((s, q) => s + q.quantity, 0);
    const reserved = reservedMap[p.id] || 0;
    const freeToUse = Math.max(0, onHand - reserved);
    const unitCost = p.costPrice || 0;
    const valuation = onHand * unitCost;
    const threshold = p.minStock ?? 10;

    return {
      ...p,
      onHand,
      reserved,
      freeToUse,
      unitCost,
      valuation,
      threshold,
      isOut: onHand <= 0,
      isLow: onHand > 0 && onHand <= threshold,
    };
  });

  const totalOnHandUnits = report.reduce((s, r) => s + r.onHand, 0);
  const totalValuation = report.reduce((s, r) => s + r.valuation, 0);
  const lowCount = report.filter((r) => r.isLow).length;
  const outCount = report.filter((r) => r.isOut).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="text-indigo-600" /> Stock Availability & Valuation
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time on-hand quantities, free-to-use allocations, per-unit costs, and warehouse valuations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <PackageCheck size={16} className="text-indigo-600" /> Total On-Hand Units
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalOnHandUnits}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Coins size={16} className="text-emerald-600" /> Total Stock Valuation
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            ₹{totalValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle size={16} className="text-amber-500" /> Low Stock Items
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{lowCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex items-center gap-2 text-red-700 text-xs font-semibold uppercase tracking-wider">
            <AlertOctagon size={16} className="text-red-500" /> Out of Stock
          </div>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{outCount}</p>
        </div>
      </div>

      {/* Stock Report Table matching Mockup */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Per Unit Cost</th>
              <th className="px-6 py-3 font-medium text-right">On Hand</th>
              <th className="px-6 py-3 font-medium text-right">Free To Use</th>
              <th className="px-6 py-3 font-medium">Stock by Location</th>
              <th className="px-6 py-3 font-medium">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {r.name}
                  <div className="text-xs font-normal text-slate-400">{r.category}</div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500 font-medium">{r.sku}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  ₹{r.unitCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm font-extrabold text-slate-800 text-right">
                  {r.onHand} {r.uom}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-700 text-right">
                  {r.freeToUse} {r.uom}
                  {r.reserved > 0 && (
                    <span className="text-[10px] text-slate-400 block font-normal">
                      ({r.reserved} reserved)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 space-y-0.5">
                  {r.stockQuants.map((q) => (
                    <div key={q.id}>
                      {q.location.name}:{" "}
                      <span className="font-semibold text-slate-700">
                        {q.quantity} {r.uom}
                      </span>
                    </div>
                  ))}
                  {r.stockQuants.length === 0 && <span>No location stock</span>}
                </td>
                <td className="px-6 py-4">
                  {r.isOut ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                      OUT
                    </span>
                  ) : r.isLow ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                      LOW (≤{r.threshold})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                      HEALTHY
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {report.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  No products in inventory yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
