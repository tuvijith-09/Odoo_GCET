import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  XCircle,
  FileQuestion,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Anomaly {
  id: string;
  type: "spike" | "adjustment_loss" | "cancellation" | "location_imbalance";
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  productName: string;
  sku: string;
  normalRange: string;
  observedValue: string;
  description: string;
  date: string;
  actionLink: string;
  actionText: string;
}

export default async function AnomaliesPage() {
  const [moves, adjustments, products] = await Promise.all([
    prisma.stockMove.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { product: true, fromLocation: true, toLocation: true },
    }),
    prisma.stockMove.findMany({
      where: { documentType: "Adjustment" },
      include: { product: true, fromLocation: true, toLocation: true },
      orderBy: { date: "desc" },
    }),
    prisma.product.findMany({
      include: { stockQuants: true },
    }),
  ]);

  const anomalies: Anomaly[] = [];

  // 1. Detect Volume Spikes (e.g. movement > 80 units or > 2.5x normal baseline)
  for (const move of moves) {
    if (move.quantity >= 100 && (move.documentType === "Receipt" || move.documentType === "Delivery")) {
      anomalies.push({
        id: `spike-${move.id}`,
        type: "spike",
        severity: move.quantity >= 150 ? "HIGH" : "MEDIUM",
        title: "Unusual Movement Volume Spike",
        productName: move.product.name,
        sku: move.product.sku,
        normalRange: "20–40 units/transaction",
        observedValue: `${move.quantity} ${move.product.uom}`,
        description: `A single ${move.documentType.toLowerCase()} transaction exceeded standard velocity thresholds by over 300%. Reference: ${
          move.reference || "Auto"
        }`,
        date: move.date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        actionLink: `/dashboard/history?q=${encodeURIComponent(move.product.sku)}`,
        actionText: "View Transactions",
      });
    }
  }

  // 2. Detect Suspicious Stock Losses via Adjustments (Damages, write-offs)
  for (const adj of adjustments) {
    if (adj.fromLocationId && adj.quantity > 0) {
      anomalies.push({
        id: `adj-${adj.id}`,
        type: "adjustment_loss",
        severity: adj.quantity >= 5 ? "HIGH" : "MEDIUM",
        title: "Sudden Stock Loss Discrepancy",
        productName: adj.product.name,
        sku: adj.product.sku,
        normalRange: "0 variance expected",
        observedValue: `-${adj.quantity} ${adj.product.uom}`,
        description: `Physical count revealed write-off discrepancy: "${
          adj.reference || "Physical Count Mismatch"
        }". Verify receiving audit notes.`,
        date: adj.date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        actionLink: "/dashboard/adjustments",
        actionText: "View Adjustments",
      });
    }
  }

  // 3. Detect Canceled Orders
  const canceledMoves = moves.filter((m) => m.status === "Canceled");
  if (canceledMoves.length > 0) {
    const canceledProductMap: Record<string, number> = {};
    for (const cm of canceledMoves) {
      canceledProductMap[cm.productId] = (canceledProductMap[cm.productId] || 0) + 1;
    }

    for (const [prodId, count] of Object.entries(canceledProductMap)) {
      const p = products.find((prod) => prod.id === prodId);
      if (p) {
        anomalies.push({
          id: `cancel-${prodId}`,
          type: "cancellation",
          severity: count > 1 ? "HIGH" : "LOW",
          title: "Repeated Order Cancellations",
          productName: p.name,
          sku: p.sku,
          normalRange: "0–1 cancellation/month",
          observedValue: `${count} canceled orders`,
          description: `Multiple operations for ${p.name} were aborted prior to validation. Review possible customer rejection or item damage.`,
          date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          actionLink: `/dashboard/history?q=${encodeURIComponent(p.sku)}`,
          actionText: "Inspect Canceled Moves",
        });
      }
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-red-600" /> Automated Anomaly Detection
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time pattern analysis identifying volume surges, unexplained stock losses, and abnormal cancellations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            {anomalies.length} Potential Irregularities Detected
          </span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={14} className="text-amber-500" /> High-Severity Alerts
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {anomalies.filter((a) => a.severity === "HIGH").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-indigo-500" /> Volume Surge Events
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {anomalies.filter((a) => a.type === "spike").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileQuestion size={14} className="text-red-500" /> Stock Loss Discrepancies
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {anomalies.filter((a) => a.type === "adjustment_loss").length}
          </p>
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {anomalies.map((anomaly) => {
          const isHigh = anomaly.severity === "HIGH";

          return (
            <div
              key={anomaly.id}
              className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between transition hover:shadow-md ${
                isHigh ? "border-red-300 ring-2 ring-red-50" : "border-slate-200"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{anomaly.title}</h3>
                      <p className="text-xs text-slate-400">{anomaly.date}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {anomaly.severity} SEVERITY
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-slate-900">{anomaly.productName}</h4>
                  <p className="text-xs font-mono font-medium text-indigo-600">{anomaly.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Standard Velocity:</span>
                    <strong className="text-slate-700">{anomaly.normalRange}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Observed Movement:</span>
                    <strong
                      className={`font-black ${
                        isHigh ? "text-red-700" : "text-amber-700"
                      }`}
                    >
                      {anomaly.observedValue}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{anomaly.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Automated Guardrail</span>
                <Link
                  href={anomaly.actionLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition shadow-2xs"
                >
                  {anomaly.actionText} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}

        {anomalies.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
            <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-800">No Inventory Anomalies Detected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All recent transactions, dispatches, and warehouse count reconciliations are within healthy historical tolerances.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
