import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Warehouse } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const locations = await prisma.location.findMany({
    include: { stockQuants: { include: { product: true } } },
    orderBy: { name: "asc" },
  });

  async function addLocation(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const isWarehouse = formData.get("isWarehouse") === "on";
    await prisma.location.create({ data: { name, isWarehouse } });
    redirect("/dashboard/warehouses");
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Warehouses & Locations</h1>
          <p className="text-slate-500 mt-1">Manage storage locations and view stock per location</p>
        </div>
      </div>

      {/* Add Location Form */}
      <form action={addLocation} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Location Name</label>
          <input type="text" name="name" required placeholder="e.g. Rack A, Cold Storage" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isWarehouse" className="w-4 h-4 text-indigo-600 rounded" />
          <span className="text-sm text-slate-700">Is Warehouse</span>
        </label>
        <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">Add Location</button>
      </form>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${loc.isWarehouse ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                <Warehouse size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{loc.name}</h3>
                <p className="text-xs text-slate-400">{loc.isWarehouse ? "Warehouse" : "Location"}</p>
              </div>
            </div>
            {loc.stockQuants.length === 0 ? (
              <p className="text-sm text-slate-400">No stock at this location</p>
            ) : (
              <div className="space-y-2">
                {loc.stockQuants.map((q) => (
                  <div key={q.id} className="flex justify-between text-sm border-b border-slate-50 pb-1">
                    <span className="text-slate-600">{q.product.name}</span>
                    <span className="font-semibold text-slate-800">{q.quantity} {q.product.uom}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {locations.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">No locations created yet.</div>
        )}
      </div>
    </div>
  );
}
