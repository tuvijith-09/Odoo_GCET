import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PackagePlus, Edit2, AlertTriangle, Layers } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";
import ProductQrModal from "@/components/ProductQrModal";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { category: { contains: q } },
    ];
  }
  if (category && category !== "All") {
    whereClause.category = category;
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { stockQuants: { include: { location: true } } },
    orderBy: { name: "asc" },
  });

  // Get distinct categories for quick category filter pills
  const allProducts = await prisma.product.findMany({ select: { category: true } });
  const distinctCategories = Array.from(new Set(allProducts.map((p) => p.category)));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            Product catalog, per-location stock, unit costs & reordering rules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchFilter placeholder="Search SKU, Name, Category..." />
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200 shrink-0"
          >
            <PackagePlus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      {distinctCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Layers size={14} /> Categories:
          </span>
          <Link
            href="/dashboard/products"
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              !category || category === "All"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Categories
          </Link>
          {distinctCategories.map((cat) => (
            <Link
              key={cat}
              href={`/dashboard/products?category=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Product Name</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Cost / Unit</th>
              <th className="px-6 py-3 font-medium text-right">Total Stock</th>
              <th className="px-6 py-3 font-medium">Reorder Rule</th>
              <th className="px-6 py-3 font-medium">Stock by Location</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const totalStock = product.stockQuants.reduce(
                (acc, q) => acc + q.quantity,
                0
              );
              const minThreshold = product.minStock ?? 10;
              const isLow = totalStock <= minThreshold;
              const isOut = totalStock <= 0;

              return (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500 font-medium">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    ₹{product.costPrice?.toFixed(2) ?? "0.00"}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-bold text-right ${
                      isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-slate-800"
                    }`}
                  >
                    {totalStock} {product.uom}
                    {isOut ? (
                      <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                        OUT
                      </span>
                    ) : isLow ? (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                        LOW
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Min: {minThreshold}</span>
                    <span className="text-slate-400"> (Reorder: +{product.reorderQty ?? 50})</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 space-y-0.5">
                    {product.stockQuants.map((q) => (
                      <div key={q.id}>
                        {q.location.name}:{" "}
                        <span className="font-medium text-slate-600">
                          {q.quantity} {product.uom}
                        </span>
                      </div>
                    ))}
                    {product.stockQuants.length === 0 && <span>No stock registered</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <ProductQrModal
                        product={{
                          id: product.id,
                          name: product.name,
                          sku: product.sku,
                          category: product.category,
                          uom: product.uom,
                          costPrice: product.costPrice,
                        }}
                      />
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                      >
                        <Edit2 size={12} /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                  {q || category
                    ? "No products match your filter criteria."
                    : "No products yet. Click 'Add Product' to create your first one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
