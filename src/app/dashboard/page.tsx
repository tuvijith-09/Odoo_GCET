import { prisma } from "@/lib/prisma";
import {
  Package,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalProducts = await prisma.product.count();

  const quants = await prisma.stockQuant.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  });
  const lowStockCount = quants.filter(
    (q) => (q._sum.quantity || 0) < 10
  ).length;

  const pendingReceipts = await prisma.stockMove.count({
    where: { documentType: "Receipt", status: { not: "Done" } },
  });

  const pendingDeliveries = await prisma.stockMove.count({
    where: { documentType: "Delivery", status: { not: "Done" } },
  });

  const pendingTransfers = await prisma.stockMove.count({
    where: { documentType: "Internal", status: { not: "Done" } },
  });

  const recentMoves = await prisma.stockMove.findMany({
    take: 8,
    orderBy: { date: "desc" },
    include: { product: true, fromLocation: true, toLocation: true },
  });

  // Low-stock products for alert
  const lowStockProducts = await prisma.product.findMany({
    include: { stockQuants: true },
  });
  const alerts = lowStockProducts
    .map((p) => ({
      ...p,
      total: p.stockQuants.reduce((s, q) => s + q.quantity, 0),
    }))
    .filter((p) => p.total < 10);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Real-time inventory overview & operations
          </p>
        </div>
        <div className="text-sm text-slate-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package size={22} />}
          color="blue"
          href="/dashboard/products"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount}
          icon={<TrendingDown size={22} />}
          color="red"
          href="/dashboard/stock"
        />
        <KPICard
          title="Pending Receipts"
          value={pendingReceipts}
          icon={<ArrowDownToLine size={22} />}
          color="green"
          href="/dashboard/receipts"
        />
        <KPICard
          title="Pending Deliveries"
          value={pendingDeliveries}
          icon={<ArrowUpFromLine size={22} />}
          color="orange"
          href="/dashboard/deliveries"
        />
        <KPICard
          title="Pending Transfers"
          value={pendingTransfers}
          icon={<RefreshCw size={22} />}
          color="purple"
          href="/dashboard/transfers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Moves */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-slate-800">
              Recent Movements
            </h2>
            <Link
              href="/dashboard/history"
              className="text-sm text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Qty</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMoves.map((move) => (
                  <tr
                    key={move.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {move.date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
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
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">
                      {move.product.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {move.quantity}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={move.status} />
                    </td>
                  </tr>
                ))}
                {recentMoves.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No movements yet. Create a receipt to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                All stock levels are healthy ✓
              </p>
            )}
            {alerts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {product.total}
                  </p>
                  <p className="text-[10px] text-red-400 uppercase font-semibold">
                    {product.uom} left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Link
      href={href}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Done: "bg-emerald-100 text-emerald-700",
    Ready: "bg-blue-100 text-blue-700",
    Canceled: "bg-red-100 text-red-700",
    Draft: "bg-slate-100 text-slate-600",
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
