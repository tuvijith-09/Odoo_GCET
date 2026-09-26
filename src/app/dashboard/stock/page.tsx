import { prisma } from "@/lib/prisma";
import { BarChart3, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockReportPage() {
  const products = await prisma.product.findMany({
    include: { stockQuants: { include: { location: true } } },
    orderBy: { name: "asc" },
  });

  const report = products.map((p) => ({
    ...p,
    total: p.stockQuants.reduce((s, q) => s + q.quantity, 0),
  }));

  const totalValue = report.reduce((s, r) => s + r.total, 0);
  const lowCount = report.filter((r) => r.total < 10).length;
  const outCount = report.filter((r) => r.total <= 0).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="text-indigo-600" /> Stock Report
        </h1>
        <p className="text-slate-500 mt-1">
          Consolidated view of current stock levels across all locations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Units in Stock</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalValue}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle size={12} /> Low Stock Products
          </p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{lowCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
          <p className="text-xs text-red-600 font-medium">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{outCount}</p>
        </div>
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium text-right">Total Stock</th>
              <th className="px-6 py-3 font-medium">Breakdown by Location</th>
              <th className="px-6 py-3 font-medium">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">{r.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{r.sku}</td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.category}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-right text-slate-800">
                  {r.total} {r.uom}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 space-y-0.5">
                  {r.stockQuants.map((q) => (
                    <div key={q.id}>
                      {q.location.name}: <span className="font-medium text-slate-600">{q.quantity}</span>
                    </div>
                  ))}
                  {r.stockQuants.length === 0 && <span>—</span>}
                </td>
                <td className="px-6 py-4">
                  {r.total <= 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">OUT</span>
                  ) : r.total < 10 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">LOW</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
