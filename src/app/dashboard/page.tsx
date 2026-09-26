import { prisma } from "@/lib/prisma";
import {
  Package,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Truck,
  CheckCircle2,
  Bot,
  Scan,
  Sparkles,
  ShieldAlert,
  AreaChart,
} from "lucide-react";
import Link from "next/link";
import DashboardFilters from "@/components/DashboardFilters";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    docType?: string;
    status?: string;
    locationId?: string;
    category?: string;
  }>;
}) {
  const { docType, status, locationId, category } = await searchParams;

  // 1. Total Products
  const totalProducts = await prisma.product.count();

  // 2. Fetch products with quants to compute real low-stock and out-of-stock
  const allProducts = await prisma.product.findMany({
    include: { stockQuants: true },
  });

  const productsWithStock = allProducts.map((p) => {
    const total = p.stockQuants.reduce((s, q) => s + q.quantity, 0);
    const threshold = p.minStock ?? 10;
    return {
      ...p,
      total,
      threshold,
      isLow: total <= threshold && total > 0,
      isOut: total <= 0,
    };
  });

  const lowStockCount = productsWithStock.filter((p) => p.isLow).length;
  const outOfStockCount = productsWithStock.filter((p) => p.isOut).length;
  const combinedAlertCount = lowStockCount + outOfStockCount;

  // 3. Pending Receipts (Draft, Waiting, Ready)
  const pendingReceipts = await prisma.stockMove.count({
    where: {
      documentType: "Receipt",
      status: { in: ["Draft", "Waiting", "Ready"] },
    },
  });

  // 4. Pending Deliveries (Draft, Waiting, Ready)
  const pendingDeliveries = await prisma.stockMove.count({
    where: {
      documentType: "Delivery",
      status: { in: ["Draft", "Waiting", "Ready"] },
    },
  });

  // 5. Internal Transfers Scheduled (Draft, Waiting, Ready)
  const scheduledTransfers = await prisma.stockMove.count({
    where: {
      documentType: "Internal",
      status: { in: ["Draft", "Waiting", "Ready"] },
    },
  });

  // Fetch locations & categories for dynamic filters
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const categories = Array.from(new Set(allProducts.map((p) => p.category)));

  // Dynamic filter query for recent movements
  const moveFilter: any = {};
  if (docType && docType !== "All") {
    moveFilter.documentType = docType;
  }
  if (status && status !== "All") {
    moveFilter.status = status;
  }
  if (locationId && locationId !== "All") {
    moveFilter.OR = [{ fromLocationId: locationId }, { toLocationId: locationId }];
  }
  if (category && category !== "All") {
    moveFilter.product = { category };
  }

  const recentMoves = await prisma.stockMove.findMany({
    where: moveFilter,
    take: 10,
    orderBy: { date: "desc" },
    include: { product: true, fromLocation: true, toLocation: true },
  });

  // Low stock alert items
  const alertProducts = productsWithStock.filter((p) => p.isLow || p.isOut);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Centralized stock operations snapshot & real-time KPIs
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start sm:self-auto">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* PS Dashboard KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Products"
          value={totalProducts}
          subtitle="Catalog Items"
          icon={<Package size={22} />}
          color="blue"
          href="/dashboard/products"
        />
        <KPICard
          title="Low / Out of Stock"
          value={combinedAlertCount}
          subtitle={`${outOfStockCount} out of stock`}
          icon={<TrendingDown size={22} />}
          color="red"
          href="/dashboard/stock"
        />
        <KPICard
          title="Pending Receipts"
          value={pendingReceipts}
          subtitle="Incoming to receive"
          icon={<ArrowDownToLine size={22} />}
          color="green"
          href="/dashboard/receipts"
        />
        <KPICard
          title="Pending Deliveries"
          value={pendingDeliveries}
          subtitle="Outgoing to dispatch"
          icon={<ArrowUpFromLine size={22} />}
          color="orange"
          href="/dashboard/deliveries"
        />
        <KPICard
          title="Internal Transfers"
          value={scheduledTransfers}
          subtitle="Scheduled moves"
          icon={<RefreshCw size={22} />}
          color="purple"
          href="/dashboard/transfers"
        />
      </div>

      {/* Mockup Operations Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receipt Quick Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ClipboardList size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Receipts (Incoming Stock)</h3>
                <p className="text-xs text-slate-400">Receive goods from suppliers</p>
              </div>
            </div>
            <Link
              href="/dashboard/receipts/new"
              className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
            >
              + New Receipt
            </Link>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-emerald-700 text-sm">{pendingReceipts}</strong> to receive
            </span>
            <Link
              href="/dashboard/receipts"
              className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              View Operations <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Delivery Quick Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Delivery Orders (Outgoing Stock)</h3>
                <p className="text-xs text-slate-400">Ship items to customers</p>
              </div>
            </div>
            <Link
              href="/dashboard/deliveries/new"
              className="text-xs font-semibold bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition"
            >
              + New Delivery
            </Link>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-orange-700 text-sm">{pendingDeliveries}</strong> to deliver
            </span>
            <Link
              href="/dashboard/deliveries"
              className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              View Operations <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* AI & Automation Quick Hub Strip */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-300" /> StockSense AI & Smart Automation
            </span>
          </div>
          <h3 className="text-lg font-bold">Ask AI, Scan Barcodes & Forecast Stock Run-Out</h3>
          <p className="text-xs text-indigo-200">
            Natural language database queries, mobile QR scanning, predictive depletion alerts, and anomaly detection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition shadow-sm"
          >
            <Bot size={15} className="text-indigo-600" /> AI Assistant
          </Link>
          <Link
            href="/dashboard/scanner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/30 text-white font-semibold text-xs transition"
          >
            <Scan size={15} /> QR Scanner
          </Link>
          <Link
            href="/dashboard/predictions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/30 text-white font-semibold text-xs transition"
          >
            <Sparkles size={15} /> Reorder Predictions
          </Link>
          <Link
            href="/dashboard/anomalies"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/30 text-white font-semibold text-xs transition"
          >
            <ShieldAlert size={15} /> Anomaly Guard
          </Link>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/30 text-white font-semibold text-xs transition"
          >
            <AreaChart size={15} /> Analytics
          </Link>
        </div>
      </div>

      {/* Dynamic Filter Bar */}
      <DashboardFilters locations={locations} categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Filtered Movements Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <div>
              <h2 className="font-semibold text-base text-slate-800">
                Filtered Stock Movements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live ledger records matching your dynamic filters
              </p>
            </div>
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              Full Ledger Trail →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Doc Type</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Route / Location</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMoves.map((move) => {
                  const locationName =
                    move.documentType === "Receipt"
                      ? move.toLocation?.name || "Main Warehouse"
                      : move.documentType === "Delivery"
                      ? move.fromLocation?.name || "Main Warehouse"
                      : move.documentType === "Adjustment"
                      ? (move.fromLocation || move.toLocation)?.name || "Warehouse"
                      : `${move.fromLocation?.name || "Source"} → ${move.toLocation?.name || "Dest"}`;

                  return (
                    <tr
                      key={move.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-3 text-xs text-slate-500 font-medium">
                        {move.date.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            move.documentType === "Receipt"
                              ? "bg-green-50 text-green-700"
                              : move.documentType === "Delivery"
                              ? "bg-orange-50 text-orange-700"
                              : move.documentType === "Adjustment"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {move.documentType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">
                        {move.product.name}
                        <span className="text-xs font-mono text-slate-400 font-normal block">
                          {move.product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {locationName}
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-slate-800 text-right">
                        {move.quantity} {move.product.uom}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={move.status} />
                      </td>
                    </tr>
                  );
                })}
                {recentMoves.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400 text-sm"
                    >
                      No movements matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Out of Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-base text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Stock Health Alerts
            </h2>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              {alertProducts.length} items
            </span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {alertProducts.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium text-slate-700">All stock levels healthy</p>
                <p className="text-xs text-slate-400">All items are above minimum reorder points.</p>
              </div>
            )}
            {alertProducts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  product.isOut
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {product.sku} • Min Threshold: {product.threshold}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      product.isOut ? "text-red-700" : "text-amber-700"
                    }`}
                  >
                    {product.total} {product.uom}
                  </p>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      product.isOut
                        ? "bg-red-200 text-red-800"
                        : "bg-amber-200 text-amber-800"
                    }`}
                  >
                    {product.isOut ? "OUT OF STOCK" : "LOW STOCK"}
                  </span>
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
  subtitle,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Link
      href={href}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {value}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </Link>
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
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
