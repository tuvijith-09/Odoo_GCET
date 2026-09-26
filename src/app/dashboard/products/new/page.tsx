"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { PackagePlus, ArrowLeft, AlertCircle } from "lucide-react";
import { createProductAction } from "@/app/actions";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createProductAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success("Product created successfully!");
        router.push("/dashboard/products");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create product.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-2"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <PackagePlus className="text-indigo-600" /> New Product
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new product with SKU, reordering rules, and initial inventory
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"
      >
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Basic Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Steel Rods 12mm"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                SKU / Code *
              </label>
              <input
                type="text"
                name="sku"
                required
                placeholder="e.g. ST-001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category *
              </label>
              <input
                type="text"
                name="category"
                required
                placeholder="e.g. Raw Material, Furniture, Hardware"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Unit of Measure
              </label>
              <select
                name="uom"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="m">Meters (m)</option>
                <option value="box">Boxes (box)</option>
                <option value="litre">Litres (L)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Per Unit Cost (₹ / $)
              </label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                defaultValue={0}
                min={0}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Initial Stock
              </label>
              <input
                type="number"
                name="initialStock"
                defaultValue={0}
                min={0}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Reordering Rules Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Automated Reordering Rules
            </h3>
            <span className="text-[11px] text-slate-400">Low Stock Prevention</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Minimum Stock Alert Threshold
              </label>
              <input
                type="number"
                name="minStock"
                defaultValue={10}
                min={0}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">
                Triggers Low Stock Alert when stock drops below this number
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Reorder Quantity
              </label>
              <input
                type="number"
                name="reorderQty"
                defaultValue={50}
                min={1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">
                Suggested replenishment quantity when restocking
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link
            href="/dashboard/products"
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
