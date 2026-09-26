"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { cancelMove } from "@/app/actions";

export default function CancelButton({
  id,
  returnPath,
}: {
  id: string;
  returnPath: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelMove(id, returnPath);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Move canceled.");
      }
    });
  };

  return (
    <button
      disabled={isPending}
      onClick={handleCancel}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
        isPending
          ? "bg-slate-100 text-slate-400 cursor-wait"
          : "bg-red-50 text-red-600 hover:bg-red-100"
      }`}
    >
      {isPending ? "..." : "Cancel"}
    </button>
  );
}
