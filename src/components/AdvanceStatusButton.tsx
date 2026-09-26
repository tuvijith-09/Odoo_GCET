"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { advanceMoveStatus } from "@/app/actions";
import { ArrowRight } from "lucide-react";

export default function AdvanceStatusButton({
  id,
  nextStatus,
  label,
}: {
  id: string;
  nextStatus: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAdvance = () => {
    startTransition(async () => {
      try {
        const res = await advanceMoveStatus(id, nextStatus);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(`Status updated to ${nextStatus}!`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update status.";
        toast.error(message);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleAdvance}
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
        isPending
          ? "bg-slate-100 text-slate-400 cursor-wait"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
      }`}
    >
      {isPending ? "..." : label}
      <ArrowRight size={12} />
    </button>
  );
}
