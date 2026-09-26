import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewDeliveryPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

  async function createDelivery(formData: FormData) {
    "use server";
    const reference = formData.get("reference") as string;
    const productId = formData.get("productId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    await prisma.stockMove.create({
      data: { reference, productId, fromLocationId, quantity, documentType: "Delivery", status: "Ready" },
    });
    redirect("/dashboard/deliveries");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Delivery Order</h1>
        <p className="text-slate-500 mt-1">Ship products to a customer</p>
      </div>
      <form action={createDelivery} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Sales Order / Reference</label>
          <input type="text" name="reference" placeholder="e.g. SO-001" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Product *</label>
            <select name="productId" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white">
              <option value="">Select product...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Source Location *</label>
            <select name="fromLocationId" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white">
              <option value="">Select source...</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity *</label>
          <input type="number" name="quantity" required min="1" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <a href="/dashboard/deliveries" className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</a>
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200">Create Delivery</button>
        </div>
      </form>
    </div>
  );
}
