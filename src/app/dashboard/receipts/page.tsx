import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReceiptsView from "./ReceiptsView";
import { ClipboardList, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const receipts = await prisma.stockMove.findMany({
    where: { documentType: "Receipt" },
    include: { product: true, toLocation: true },
    orderBy: { date: "desc" },
  });

  const serialized = receipts.map((r) => ({
    id: r.id,
    reference: r.reference,
    partner: r.partner,
    responsible: r.responsible,
    quantity: r.quantity,
    status: r.status,
    date: r.date.toISOString(),
    product: {
      name: r.product.name,
      sku: r.product.sku,
      uom: r.product.uom,
    },
    toLocation: r.toLocation ? { name: r.toLocation.name } : null,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-indigo-600" /> Incoming Receipts
          </h1>
          <p className="text-slate-500 mt-1">
            Receive vendor goods, advance status, print PO slips & increment stock (List and Kanban view)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/receipts/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Receipt
          </Link>
        </div>
      </div>

      <ReceiptsView receipts={serialized} />
    </div>
  );
}
