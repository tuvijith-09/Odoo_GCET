import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewDeliveryPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

  async function createDelivery(formData: FormData) {
    "use server";
    const partner = (formData.get("partner") as string)?.trim() || "Customer Order";
    const reference = (formData.get("reference") as string)?.trim() || `SO-${Date.now().toString().slice(-4)}`;
    const productId = formData.get("productId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const quantity = Math.max(1, parseInt((formData.get("quantity") as string) || "1"));
    const scheduledDateStr = formData.get("scheduledDate") as string;
    const responsible = (formData.get("responsible") as string)?.trim() || "Shipping Bay";
    const initialStatus = (formData.get("status") as string) || "Waiting";

    if (!productId || !fromLocationId) {
      return;
    }

    await prisma.stockMove.create({
      data: {
        reference,
        partner,
        productId,
        fromLocationId,
        quantity,
        documentType: "Delivery",
        status: initialStatus,
        responsible,
        scheduledDate: scheduledDateStr ? new Date(scheduledDateStr) : new Date(),
      },
    });

    redirect("/dashboard/deliveries");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/deliveries"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-2"
        >
          <ArrowLeft size={14} /> Back to Delivery Orders
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <Truck className="text-indigo-600" /> New Delivery Order
        </h1>
        <p className="text-slate-500 mt-1">Dispatch goods to a customer with pick & pack tracking</p>
      </div>

      <form
        action={createDelivery}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Customer / Client *
            </label>
            <input
              type="text"
              name="partner"
              required
              placeholder="e.g. Zenith Furniture Ltd"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Sales Order / Reference
            </label>
            <input
              type="text"
              name="reference"
              placeholder="e.g. SO-2026-904"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Product *
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Source Location *
            </label>
            <select
              name="fromLocationId"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select source location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.isWarehouse ? "(Warehouse)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity to Dispatch *
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              defaultValue={10}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Scheduled Date
            </label>
            <input
              type="date"
              name="scheduledDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Initial Stage
            </label>
            <select
              name="status"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="Waiting">Waiting (Pending Pick & Pack)</option>
              <option value="Draft">Draft</option>
              <option value="Ready">Ready for Shipment</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Responsible Staff
          </label>
          <input
            type="text"
            name="responsible"
            placeholder="e.g. Sarah Connor (Fulfillment)"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link
            href="/dashboard/deliveries"
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200"
          >
            Create Delivery Order
          </button>
        </div>
      </form>
    </div>
  );
}
