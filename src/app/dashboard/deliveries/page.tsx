import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeliveriesView from "./DeliveriesView";
import { Truck, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const deliveries = await prisma.stockMove.findMany({
    where: { documentType: "Delivery" },
    include: { product: true, fromLocation: true },
    orderBy: { date: "desc" },
  });

  const serialized = deliveries.map((d) => ({
    id: d.id,
    reference: d.reference,
    partner: d.partner,
    responsible: d.responsible,
    quantity: d.quantity,
    status: d.status,
    isPicked: d.isPicked,
    isPacked: d.isPacked,
    date: d.date.toISOString(),
    product: {
      name: d.product.name,
      sku: d.product.sku,
      uom: d.product.uom,
    },
    fromLocation: d.fromLocation ? { name: d.fromLocation.name } : null,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Truck className="text-indigo-600" /> Delivery Orders
          </h1>
          <p className="text-slate-500 mt-1">
            Pick items, pack shipments, print delivery notes & dispatch stock to customers (List and Kanban view)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/deliveries/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <Plus size={18} /> New Delivery
          </Link>
        </div>
      </div>

      <DeliveriesView deliveries={serialized} />
    </div>
  );
}
