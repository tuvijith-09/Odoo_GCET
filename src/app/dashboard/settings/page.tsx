import { prisma } from "@/lib/prisma";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const productCount = await prisma.product.count();
  const locationCount = await prisma.location.count();
  const moveCount = await prisma.stockMove.count();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-slate-500" /> Settings
        </h1>
        <p className="text-slate-500 mt-1">System information and configuration</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="font-semibold text-lg text-slate-800">System Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-800">{productCount}</p>
            <p className="text-xs text-slate-500 mt-1">Products</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-800">{locationCount}</p>
            <p className="text-xs text-slate-500 mt-1">Locations</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-800">{moveCount}</p>
            <p className="text-xs text-slate-500 mt-1">Stock Moves</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="font-medium text-slate-700 mb-2">About</h3>
          <div className="text-sm text-slate-500 space-y-1">
            <p><strong>App:</strong> StockSense v1.0</p>
            <p><strong>Framework:</strong> Next.js + Tailwind CSS + Prisma</p>
            <p><strong>Database:</strong> SQLite (local)</p>
            <p><strong>Architecture:</strong> Server Components + Server Actions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
