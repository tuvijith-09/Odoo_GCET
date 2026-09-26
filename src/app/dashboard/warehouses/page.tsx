import { prisma } from "@/lib/prisma";
import { Warehouse, MapPin } from "lucide-react";
import NewWarehouseForm from "./NewWarehouseForm";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const locations = await prisma.location.findMany({
    include: { stockQuants: { include: { product: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Warehouse className="text-indigo-600" /> Warehouses & Storage Locations
          </h1>
          <p className="text-slate-500 mt-1">
            Configure physical facilities, aisles, shelving racks, and cold storage
          </p>
        </div>
      </div>

      {/* Add Location / Warehouse Form */}
      <NewWarehouseForm />

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const totalUnits = loc.stockQuants.reduce((s, q) => s + q.quantity, 0);

          return (
            <div
              key={loc.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        loc.isWarehouse
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Warehouse size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{loc.name}</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {loc.isWarehouse ? "Warehouse Facility" : "Internal Rack / Zone"}
                      </span>
                    </div>
                  </div>
                  {loc.shortCode && (
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {loc.shortCode}
                    </span>
                  )}
                </div>

                {loc.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    {loc.address}
                  </p>
                )}

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Products Stored: {loc.stockQuants.length}</span>
                    <span>Total Units: {totalUnits}</span>
                  </div>

                  {loc.stockQuants.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                      No stock currently stationed at this location
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {loc.stockQuants.map((q) => (
                        <div
                          key={q.id}
                          className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg"
                        >
                          <span className="font-medium text-slate-700 truncate max-w-[160px]">
                            {q.product.name}
                          </span>
                          <span className="font-bold text-slate-900 shrink-0">
                            {q.quantity} {q.product.uom}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {locations.length === 0 && (
          <div className="col-span-full bg-white text-center py-16 rounded-xl border border-slate-200 text-slate-400">
            No locations created yet. Use the form above to add your first warehouse.
          </div>
        )}
      </div>
    </div>
  );
}
