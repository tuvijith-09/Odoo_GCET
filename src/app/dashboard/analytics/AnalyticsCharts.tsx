"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Package,
  Layers,
  Warehouse,
  AlertCircle,
  Coins,
  CheckCircle,
} from "lucide-react";

interface AnalyticsProps {
  monthlyTrends: { month: string; incoming: number; outgoing: number; internal: number }[];
  warehouseDistribution: { name: string; units: number; share: number }[];
  categoryValuation: { name: string; value: number }[];
  fastMoving: { name: string; sku: string; units: number; uom: string; velocity: string }[];
  deadStock: { name: string; sku: string; currentStock: number; uom: string; idleDays: number }[];
  kpis: {
    totalValuation: number;
    turnoverRate: string;
    fulfillmentRate: string;
    lossRate: string;
  };
}

const PIE_COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AnalyticsCharts({
  monthlyTrends,
  warehouseDistribution,
  categoryValuation,
  fastMoving,
  deadStock,
  kpis,
}: AnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Coins size={16} className="text-emerald-600" /> Capital in Inventory
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            ₹{kpis.totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Live working capital tied</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp size={16} className="text-indigo-600" /> Stock Turnover
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">{kpis.turnoverRate}</p>
          <p className="text-xs text-slate-400 mt-1">Annualized velocity index</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle size={16} className="text-blue-600" /> Order Fulfillment Rate
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{kpis.fulfillmentRate}</p>
          <p className="text-xs text-slate-400 mt-1">On-time ship rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <AlertCircle size={16} className="text-amber-500" /> Discrepancy Rate
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{kpis.lossRate}</p>
          <p className="text-xs text-slate-400 mt-1">Physical audit deviation</p>
        </div>
      </div>

      {/* Movement Time-Series Graph: Incoming vs Outgoing */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Stock Movement Trends (Incoming vs. Outgoing Volume)
            </h3>
            <p className="text-xs text-slate-500">
              Monthly comparison of vendor goods received vs customer shipments dispatched
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="incoming"
                name="Incoming Receipts"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIn)"
              />
              <Area
                type="monotone"
                dataKey="outgoing"
                name="Outgoing Deliveries"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Warehouse Distribution & Category Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Warehouse size={18} className="text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Warehouse-wise Stock Distribution</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#334155" }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`${val} units`, "Total Units"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="units" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Valuation Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Inventory Valuation by Category</h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryValuation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {categoryValuation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Category Valuation"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Fast-Moving vs Dead/Slow-Moving Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast-Moving Items */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Fast-Moving Inventory (High Velocity)</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
              Top Dispatched
            </span>
          </div>

          <div className="space-y-3">
            {fastMoving.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{item.sku}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {item.units} {item.uom}
                  </span>
                  <span className="text-[11px] text-emerald-600 block font-semibold">{item.velocity}</span>
                </div>
              </div>
            ))}
            {fastMoving.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No fast-moving items logged yet</p>
            )}
          </div>
        </div>

        {/* Dead / Slow-Moving Stock */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">Dead / Slow-Moving Stock (Idle Capital)</h3>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">
              Action Needed
            </span>
          </div>

          <div className="space-y-3">
            {deadStock.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <p className="text-xs font-mono text-slate-400">
                    {item.sku} • On-Hand: {item.currentStock} {item.uom}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Idle &gt; {item.idleDays} days
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Review discounting or bundles</span>
                </div>
              </div>
            ))}
            {deadStock.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No dead inventory detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
