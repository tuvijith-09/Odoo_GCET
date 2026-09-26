import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PackagePlus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { stockQuants: { include: { location: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product catalog & stock levels</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200"
        >
          <PackagePlus size={18} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Product Name</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">UoM</th>
              <th className="px-6 py-3 font-medium text-right">Total Stock</th>
              <th className="px-6 py-3 font-medium">Stock by Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const totalStock = product.stockQuants.reduce(
                (acc, q) => acc + q.quantity,
                0
              );
              const isLow = totalStock < 10;
              return (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{product.uom}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    isLow ? "text-red-600" : "text-slate-800"
                  }`}>
                    {totalStock}
                    {isLow && (
                      <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                        LOW
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 space-y-0.5">
                    {product.stockQuants.map((q) => (
                      <div key={q.id}>
                        {q.location.name}: <span className="font-medium text-slate-600">{q.quantity}</span>
                      </div>
                    ))}
                    {product.stockQuants.length === 0 && <span>No stock</span>}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  No products yet. Click &quot;Add Product&quot; to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
