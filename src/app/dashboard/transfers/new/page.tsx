import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewTransferPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

  async function createTransfer(formData: FormData) {
    "use server";
    const reference = (formData.get("reference") as string)?.trim() || `INT-${Date.now().toString().slice(-4)}`;
    const productId = formData.get("productId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const toLocationId = formData.get("toLocationId") as string;
    const quantity = Math.max(1, parseInt((formData.get("quantity") as string) || "1"));
    const responsible = (formData.get("responsible") as string)?.trim() || "Warehouse Logistics";

    if (!productId || !fromLocationId || !toLocationId) return;
    if (fromLocationId === toLocationId) return;

    await prisma.stockMove.create({
      data: {
        reference,
        productId,
        fromLocationId,
        toLocationId,
        quantity,
        documentType: "Internal",
        status: "Ready",
        responsible,
        partner: "Internal Logistics",
      },
    });

    redirect("/dashboard/transfers");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/transfers"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-2"
        >
          <ArrowLeft size={14} /> Back to Internal Transfers
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <ArrowLeftRight className="text-indigo-600" /> New Internal Transfer
        </h1>
        <p className="text-slate-500 mt-1">
          Relocate inventory between warehouses or internal storage racks
        </p>
      </div>

      <form
        action={createTransfer}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Transfer Purpose / Reference
          </label>
          <input
            type="text"
            name="reference"
            placeholder="e.g. Move to Production Rack, Rack A to Rack B"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Product to Transfer *
          </label>
          <select
            name="productId"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Select product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Source Location (From) *
            </label>
            <select
              name="fromLocationId"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select source...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.isWarehouse ? "(Warehouse)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Destination Location (To) *
            </label>
            <select
              name="toLocationId"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select destination...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.isWarehouse ? "(Warehouse)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              defaultValue={20}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Handler / Responsible
            </label>
            <input
              type="text"
              name="responsible"
              placeholder="e.g. Warehouse Staff"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link
            href="/dashboard/transfers"
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200"
          >
            Create Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
