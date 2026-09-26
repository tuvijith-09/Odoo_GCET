import { prisma } from "@/lib/prisma";
import AdjustmentForm from "./AdjustmentForm";

export const dynamic = "force-dynamic";

export default async function NewAdjustmentPage() {
  const products = await prisma.product.findMany({
    include: { stockQuants: true },
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Stock Adjustment</h1>
        <p className="text-slate-500 mt-1">
          Reconcile recorded inventory with physical counted stock
        </p>
      </div>

      <AdjustmentForm products={products} locations={locations} />
    </div>
  );
}
