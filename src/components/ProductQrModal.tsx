"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Printer, X, Download } from "lucide-react";

export default function ProductQrModal({
  product,
}: {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    uom: string;
    costPrice?: number | null;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Encode SKU and basic JSON for scanner
      const payload = JSON.stringify({
        sku: product.sku,
        name: product.name,
        type: "STOCKSENSE_PRODUCT",
      });
      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
      })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [isOpen, product]);

  const handlePrintLabel = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Label - ${product.sku}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
            .label-card { width: 320px; border: 2px solid #000; border-radius: 12px; padding: 20px; text-align: center; }
            .title { font-size: 16px; font-weight: 800; margin: 0 0 4px; text-transform: uppercase; }
            .sku { font-family: monospace; font-size: 18px; font-weight: 700; color: #4338ca; margin: 4px 0 12px; }
            img { width: 200px; height: 200px; margin: 0 auto; display: block; }
            .meta { font-size: 12px; color: #475569; margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">${product.name}</div>
            <div class="sku">${product.sku}</div>
            <img src="${qrUrl}" alt="QR Code" />
            <div class="meta">
              <span>Category: ${product.category}</span>
              <span>UoM: ${product.uom}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">StockSense Smart Warehouse Label</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        title="View & Print QR Code"
      >
        <QrCode size={13} /> QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Bin & Pallet Label
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{product.name}</h3>
              <p className="text-xs font-mono font-semibold text-indigo-700">{product.sku}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt={`QR code for ${product.sku}`}
                  className="w-48 h-48 rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500">
              Scan using warehouse mobile scanner or hardware barcode reader to instantly receive, transfer, dispatch, or count.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintLabel}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-indigo-700 transition shadow-sm"
              >
                <Printer size={15} /> Print Physical Label
              </button>
              {qrUrl && (
                <a
                  href={qrUrl}
                  download={`QR-${product.sku}.png`}
                  className="inline-flex items-center justify-center p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition"
                  title="Download PNG"
                >
                  <Download size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
