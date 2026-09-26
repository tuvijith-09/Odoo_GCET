"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

export default function ValidateButton({
  action,
  id,
  label = "Validate",
}: {
  action: (id: string) => Promise<{ success?: boolean; error?: string }>;
  id: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleValidate = () => {
    startTransition(async () => {
      try {
        const result = await action(id);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success) {
          toast.success("Validated successfully!");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Validation failed.";
        toast.error(message);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleValidate}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
        isPending
          ? "bg-slate-100 text-slate-400 cursor-wait"
          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
      }`}
    >
      {isPending ? "Processing..." : label}
    </button>
  );
}
