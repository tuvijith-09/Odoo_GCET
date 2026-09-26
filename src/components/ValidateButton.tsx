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
      const result = await action(id);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Validated successfully!");
      }
    });
  };

  return (
    <button
      disabled={isPending}
      onClick={handleValidate}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
        isPending
          ? "bg-slate-100 text-slate-400 cursor-wait"
          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      }`}
    >
      {isPending ? "Processing..." : label}
    </button>
  );
}
