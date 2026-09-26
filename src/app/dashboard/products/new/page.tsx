import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function NewProductPage() {
  async function createProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const category = formData.get("category") as string;
    const uom = formData.get("uom") as string;
    const initialStock = parseInt((formData.get("initialStock") as string) || "0");

    const product = await prisma.product.create({
      data: { name, sku, category, uom, initialStock },
    });

    // If initial stock > 0, find/create a default warehouse and add quant
    if (initialStock > 0) {
      let warehouse = await prisma.location.findFirst({ where: { isWarehouse: true } });
      if (!warehouse) {
        warehouse = await prisma.location.create({ data: { name: "Main Warehouse", isWarehouse: true } });
      }
      await prisma.stockQuant.create({
        data: { productId: product.id, locationId: warehouse.id, quantity: initialStock },
      });
      await prisma.stockMove.create({
        data: {
          productId: product.id,
          toLocationId: warehouse.id,
          quantity: initialStock,
          documentType: "Receipt",
          status: "Done",
          reference: "INIT-STOCK",
        },
      });
    }

    redirect("/dashboard/products");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Product</h1>
        <p className="text-slate-500 mt-1">Add a new product to your inventory catalog</p>
      </div>

      <form action={createProduct} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
          <input type="text" name="name" required placeholder="e.g. Steel Rods" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU / Code *</label>
            <input type="text" name="sku" required placeholder="e.g. ST-001" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
            <input type="text" name="category" required placeholder="e.g. Raw Material" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit of Measure</label>
            <select name="uom" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white">
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="m">Meters (m)</option>
              <option value="box">Boxes</option>
              <option value="litre">Litres</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Stock</label>
            <input type="number" name="initialStock" defaultValue={0} min={0} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <a href="/dashboard/products" className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</a>
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200">Save Product</button>
        </div>
      </form>
    </div>
  );
}
