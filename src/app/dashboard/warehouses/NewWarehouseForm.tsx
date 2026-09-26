"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { createWarehouseAction } from "@/app/actions";

export default function NewWarehouseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await createWarehouseAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Location / Warehouse added!");
        form.reset();
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add location.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
    >
      <h2 className="font-bold text-base text-slate-800">
        Add New Facility or Storage Rack
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Location / Warehouse Name *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Central Distribution Hub, Rack B-04"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Short Code
          </label>
          <input
            type="text"
            name="shortCode"
            placeholder="e.g. WH-MAIN, RACK-B"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Address / Zone
          </label>
          <input
            type="text"
            name="address"
            placeholder="e.g. Bay 4, Industrial Zone"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="isWarehouse"
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">
            Primary Warehouse Building (Full Facility)
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus size={16} />
          {isSubmitting ? "Saving..." : "Save Location"}
        </button>
      </div>
    </form>
  );
}
