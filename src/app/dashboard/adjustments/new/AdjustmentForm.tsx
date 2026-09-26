"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Scale, CheckCircle2 } from "lucide-react";
import { recordStockAdjustment } from "@/app/actions";

interface ProductWithQuants {
  id: string;
  name: string;
  sku: string;
  uom: string;
  stockQuants: {
    id: string;
    locationId: string;
    quantity: number;
  }[];
}

interface LocationItem {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export default function AdjustmentForm({
  products,
  locations,
}: {
  products: ProductWithQuants[];
  locations: LocationItem[];
}) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [countedQty, setCountedQty] = useState<number | "">("");
  const [reason, setReason] = useState<string>("Damaged Items");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute current recorded stock
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const matchingQuant = selectedProduct?.stockQuants.find(
    (q) => q.locationId === selectedLocationId
  );
  const recordedQty = matchingQuant ? matchingQuant.quantity : 0;

  const numericCounted = countedQty === "" ? recordedQty : Number(countedQty);
  const diff = numericCounted - recordedQty;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProductId || !selectedLocationId) {
      toast.error("Please select a product and a location.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("productId", selectedProductId);
    formData.append("locationId", selectedLocationId);
    formData.append("countedQty", numericCounted.toString());
    formData.append(
      "reason",
      reason === "Other" ? customReason || "Physical Inventory Adjustment" : reason
    );

    try {
      const res = await recordStockAdjustment(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Stock adjustment recorded in ledger!");
        router.push("/dashboard/adjustments");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record adjustment.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (products.length === 0 || locations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <p className="text-slate-600 font-medium">
          {products.length === 0
            ? "No products found. Please create a product first."
            : "No warehouse locations found. Please create a location first."}
        </p>
        <Link
          href={products.length === 0 ? "/dashboard/products/new" : "/dashboard/warehouses"}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          {products.length === 0 ? "Create Product" : "Create Location"}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select Product *
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
            Select Location *
          </label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="">Select location...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} {l.isWarehouse ? "(Warehouse)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Variance Visualizer Card */}
      {selectedProductId && selectedLocationId && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Scale size={16} /> Physical Count Reconciliation
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">System Recorded</span>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {recordedQty}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {selectedProduct?.uom}
                </span>
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">Physical Counted</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {numericCounted}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {selectedProduct?.uom}
                </span>
              </p>
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                diff === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : diff < 0
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <span className="text-xs">Ledger Discrepancy</span>
              <p className="text-xl font-bold mt-1 flex items-center justify-center gap-1">
                {diff > 0 ? (
                  <>
                    <ArrowUpRight size={18} /> +{diff}
                  </>
                ) : diff < 0 ? (
                  <>
                    <ArrowDownRight size={18} /> {diff}
                  </>
                ) : (
                  "0 (Exact)"
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Counted Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Counted Quantity (Physical Stock) *
        </label>
        <input
          type="number"
          min="0"
          value={countedQty}
          onChange={(e) =>
            setCountedQty(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder={recordedQty.toString()}
          required
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <p className="text-xs text-slate-400 mt-1">
          Enter the actual physical count verified on the floor.
        </p>
      </div>

      {/* Reason for adjustment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reason / Category *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="Damaged Items">Damaged Items (Disposal)</option>
            <option value="Annual Physical Audit">Annual Physical Inventory Audit</option>
            <option value="Inventory Shrinkage">Inventory Shrinkage / Theft</option>
            <option value="Found Unrecorded Stock">Found Unrecorded Stock</option>
            <option value="Expired Goods">Expired Goods</option>
            <option value="Other">Other Custom Reason</option>
          </select>
        </div>

        {reason === "Other" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Specify Reason
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Supplier discrepancy"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        )}
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <Link
          href="/dashboard/adjustments"
          className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? "Adjusting..." : "Record Adjustment in Ledger"}
          {!isSubmitting && <CheckCircle2 size={16} />}
        </button>
      </div>
    </form>
  );
}
