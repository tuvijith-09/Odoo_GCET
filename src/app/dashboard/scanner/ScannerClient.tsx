"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Scan,
  Camera,
  Keyboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  quickReceiveAction,
  quickDeliverAction,
  quickTransferAction,
  recordStockAdjustment,
} from "@/app/actions";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  costPrice: number;
  stockQuants: {
    id: string;
    locationId: string;
    quantity: number;
    location: {
      name: string;
    };
  }[];
}

interface LocationItem {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export default function ScannerClient({
  products,
  locations,
}: {
  products: ProductItem[];
  locations: LocationItem[];
}) {
  const router = useRouter();
  const [scanInput, setScanInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(products[0] || null);
  const [activeTab, setActiveTab] = useState<"receive" | "deliver" | "transfer" | "adjust">("receive");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [targetLocationId, setTargetLocationId] = useState(locations[0]?.id || "");
  const [sourceLocationId, setSourceLocationId] = useState(locations[0]?.id || "");
  const [toLocationId, setToLocationId] = useState(locations[1]?.id || locations[0]?.id || "");
  const [qty, setQty] = useState<number>(10);
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-focus input on load for hardware barcode scanners
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update physical count when product changes
  useEffect(() => {
    if (selectedProduct) {
      const total = selectedProduct.stockQuants.reduce((s, q) => s + q.quantity, 0);
      setPhysicalCount(total);
    }
  }, [selectedProduct]);

  // Handle SKU lookup
  const handleLookup = (searchTerm: string) => {
    const clean = searchTerm.trim().toUpperCase();
    if (!clean) return;

    // Check if JSON payload from QR
    let targetSku = clean;
    if (clean.startsWith("{") && clean.endsWith("}")) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.sku) targetSku = parsed.sku.toUpperCase();
      } catch {
        // use clean
      }
    }

    const found = products.find(
      (p) =>
        p.sku.toUpperCase() === targetSku ||
        p.name.toUpperCase().includes(targetSku) ||
        p.id === targetSku
    );

    if (found) {
      setSelectedProduct(found);
      setScanInput("");
      toast.success(`Scanned: ${found.name} (${found.sku})`);
    } else {
      toast.error(`No product found matching "${clean}"`);
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        toast.success("Camera active. Point at barcode or QR label.");
      } catch (err) {
        toast.error("Camera access denied or unavailable. You can use manual / hardware gun scanning.");
      }
    }
  };

  // 1. Quick Receive
  const handleQuickReceive = async () => {
    if (!selectedProduct || !targetLocationId || qty <= 0) return;
    setIsProcessing(true);
    try {
      const res = await quickReceiveAction(selectedProduct.id, targetLocationId, qty);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Received +${qty} ${selectedProduct.uom} into warehouse!`);
        router.refresh();
      }
    } catch {
      toast.error("Receipt failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Quick Deliver
  const handleQuickDeliver = async () => {
    if (!selectedProduct || !sourceLocationId || qty <= 0) return;
    setIsProcessing(true);
    try {
      const res = await quickDeliverAction(selectedProduct.id, sourceLocationId, qty);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Dispatched -${qty} ${selectedProduct.uom} to customer!`);
        router.refresh();
      }
    } catch {
      toast.error("Delivery failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Quick Transfer
  const handleQuickTransfer = async () => {
    if (!selectedProduct || !sourceLocationId || !toLocationId || qty <= 0) return;
    setIsProcessing(true);
    try {
      const res = await quickTransferAction(selectedProduct.id, sourceLocationId, toLocationId, qty);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Transferred ${qty} ${selectedProduct.uom}!`);
        router.refresh();
      }
    } catch {
      toast.error("Transfer failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Quick Adjust
  const handleQuickAdjust = async () => {
    if (!selectedProduct || !targetLocationId) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct.id);
      formData.append("locationId", targetLocationId);
      formData.append("countedQty", physicalCount.toString());
      formData.append("reason", "Barcode Scanner Audit Count");

      const res = await recordStockAdjustment(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Stock adjustment reconciled!");
        router.refresh();
      }
    } catch {
      toast.error("Adjustment failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTotalStock =
    selectedProduct?.stockQuants.reduce((s, q) => s + q.quantity, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Scanner Control Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl relative">
            <Scan className="absolute left-3.5 top-3.5 h-5 w-5 text-indigo-600" />
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookup(scanInput);
                }
              }}
              placeholder="Scan QR/Barcode or type SKU (e.g. ST-001, CH-100)..."
              className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
            />
            <button
              onClick={() => handleLookup(scanInput)}
              className="absolute right-2 top-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Lookup
            </button>
          </div>

          <button
            type="button"
            onClick={toggleCamera}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition shrink-0 ${
              cameraActive
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Camera size={16} />
            {cameraActive ? "Stop Camera" : "Open Camera Scanner"}
          </button>
        </div>

        {/* Quick Demo Scan Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles size={13} className="text-indigo-500" /> Quick Scan Demo:
          </span>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition shrink-0 border ${
                selectedProduct?.id === p.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p.sku} ({p.name})
            </button>
          ))}
        </div>

        {/* Live Camera Viewfinder if active */}
        {cameraActive && (
          <div className="relative w-full max-w-md mx-auto aspect-4/3 bg-black rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-white/60 m-12 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                Align QR / Barcode inside box
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scanned Product Card & Quick Actions */}
      {selectedProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Scanned Item
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedProduct.name}</h2>
                <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedProduct.sku}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">On-Hand Total</span>
                <span className="text-2xl font-black text-slate-900">
                  {currentTotalStock} {selectedProduct.uom}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Category:</span>
                <strong className="text-slate-800">{selectedProduct.category}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unit Cost:</span>
                <strong className="text-slate-800">₹{selectedProduct.costPrice?.toFixed(2)}</strong>
              </div>
            </div>

            {/* Location breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin size={13} /> Stock Per Location
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedProduct.stockQuants.map((q) => (
                  <div
                    key={q.id}
                    className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="font-medium text-slate-700">{q.location.name}</span>
                    <span className="font-bold text-slate-900">
                      {q.quantity} {selectedProduct.uom}
                    </span>
                  </div>
                ))}
                {selectedProduct.stockQuants.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No stock recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">1-Click Floor Operations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Execute stock adjustments, receiving, internal moving, or dispatching directly from barcode scan
              </p>
            </div>

            {/* Action Tabs */}
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("receive")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === "receive"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowDownToLine size={14} /> Receive
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("deliver")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === "deliver"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowUpFromLine size={14} /> Deliver
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transfer")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === "transfer"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowLeftRight size={14} /> Transfer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("adjust")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === "adjust"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal size={14} /> Adjust Count
              </button>
            </div>

            {/* Action Execution Forms */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              {/* RECEIVE PANEL */}
              {activeTab === "receive" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <ArrowDownToLine size={16} /> Quick Goods Receiving
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantity Received ({selectedProduct.uom})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Destination Warehouse / Shelf
                      </label>
                      <select
                        value={targetLocationId}
                        onChange={(e) => setTargetLocationId(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleQuickReceive}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Adding..." : `+ Add ${qty} ${selectedProduct.uom} to Stock`}
                  </button>
                </div>
              )}

              {/* DELIVER PANEL */}
              {activeTab === "deliver" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800 uppercase tracking-wider">
                    <ArrowUpFromLine size={16} /> Quick Customer Dispatch
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantity to Deduct ({selectedProduct.uom})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Source Warehouse / Shelf
                      </label>
                      <select
                        value={sourceLocationId}
                        onChange={(e) => setSourceLocationId(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleQuickDeliver}
                    className="w-full bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Deducting..." : `- Dispatch ${qty} ${selectedProduct.uom}`}
                  </button>
                </div>
              )}

              {/* TRANSFER PANEL */}
              {activeTab === "transfer" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
                    <ArrowLeftRight size={16} /> Relocate Stock
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">From Location</label>
                      <select
                        value={sourceLocationId}
                        onChange={(e) => setSourceLocationId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">To Destination</label>
                      <select
                        value={toLocationId}
                        onChange={(e) => setToLocationId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleQuickTransfer}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Moving..." : `Execute Transfer of ${qty} ${selectedProduct.uom}`}
                  </button>
                </div>
              )}

              {/* ADJUST PANEL */}
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <SlidersHorizontal size={16} /> Floor Inventory Audit Count
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Physical Counted Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={physicalCount}
                        onChange={(e) => setPhysicalCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Location Verified</label>
                      <select
                        value={targetLocationId}
                        onChange={(e) => setTargetLocationId(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleQuickAdjust}
                    className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Reconciling..." : `Reconcile Count to ${physicalCount} ${selectedProduct.uom}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
