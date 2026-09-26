"use client";

import { useTransition } from "react";

export default function ValidateButton({
  action,
  id,
  label = "Validate",
}: {
  action: (id: string) => Promise<void>;
  id: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => action(id))}
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
