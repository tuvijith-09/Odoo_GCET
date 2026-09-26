import { prisma } from "@/lib/prisma";
import ScannerClient from "./ScannerClient";
import { Scan } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const products = await prisma.product.findMany({
    include: {
      stockQuants: {
        include: { location: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Scan className="text-indigo-600" /> QR & Barcode Scanning Station
        </h1>
        <p className="text-slate-500 mt-1">
          Scan product barcodes with mobile camera or hardware barcode gun to immediately receive, transfer, dispatch, or audit inventory
        </p>
      </div>

      <ScannerClient products={products} locations={locations} />
    </div>
  );
}
