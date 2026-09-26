import { prisma } from "@/lib/prisma";
import MoveHistoryView from "./MoveHistoryView";
import { History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const rawMoves = await prisma.stockMove.findMany({
    include: { product: true, fromLocation: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  const serializedMoves = rawMoves.map((m) => ({
    id: m.id,
    reference: m.reference,
    documentType: m.documentType,
    status: m.status,
    quantity: m.quantity,
    date: m.date.toISOString(),
    product: {
      name: m.product.name,
      sku: m.product.sku,
      uom: m.product.uom,
    },
    fromLocation: m.fromLocation ? { name: m.fromLocation.name } : null,
    toLocation: m.toLocation ? { name: m.toLocation.name } : null,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <History className="text-indigo-600" /> Move History (Audit Ledger)
        </h1>
        <p className="text-slate-500 mt-1">
          Complete, unalterable audit trail of all warehouse receipts, deliveries, transfers, and adjustments
        </p>
      </div>

      <MoveHistoryView moves={serializedMoves} />
    </div>
  );
}
