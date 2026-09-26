"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-xl border border-red-200 shadow-sm p-6 text-center space-y-4">
      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">Failed to load this view</h2>
        <p className="text-sm text-slate-500 mt-1">
          {error?.message || "There was an error loading the inventory data. Please try again."}
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}
