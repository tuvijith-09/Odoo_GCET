"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Check, Box, CheckSquare, Square } from "lucide-react";
import { togglePickDelivery, togglePackDelivery } from "@/app/actions";

export default function PickPackButtons({
  id,
  isPicked,
  isPacked,
  status,
}: {
  id: string;
  isPicked: boolean;
  isPacked: boolean;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "Done" || status === "Canceled") {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <Check size={12} /> Picked
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <Box size={12} /> Packed
        </span>
      </div>
    );
  }

  const handleTogglePick = () => {
    startTransition(async () => {
      try {
        const res = await togglePickDelivery(id);
        if (res?.error) toast.error(res.error);
        else toast.success(isPicked ? "Pick unmarked" : "Items marked as Picked!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to toggle pick.";
        toast.error(message);
      }
    });
  };

  const handleTogglePack = () => {
    startTransition(async () => {
      try {
        const res = await togglePackDelivery(id);
        if (res?.error) toast.error(res.error);
        else toast.success(isPacked ? "Pack unmarked" : "Items marked as Packed!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to toggle pack.";
        toast.error(message);
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={handleTogglePick}
        title="1. Pick items from shelves"
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition ${
          isPicked
            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {isPicked ? <CheckSquare size={12} /> : <Square size={12} />}
        Pick
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleTogglePack}
        title="2. Pack items into shipping container"
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition ${
          isPacked
            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {isPacked ? <CheckSquare size={12} /> : <Square size={12} />}
        Pack
      </button>
    </div>
  );
}
