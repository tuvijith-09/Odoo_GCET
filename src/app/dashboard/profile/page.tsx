import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { User, ShieldCheck, Mail, Calendar, Key, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");
  let userEmail = "admin@stocksense.com";
  let userName = "Alex Morgan";
  let userRole = "MANAGER";

  if (authCookie?.value) {
    try {
      const parsed = JSON.parse(authCookie.value);
      userEmail = parsed.email || userEmail;
      userName = parsed.name || userName;
      userRole = parsed.role || userRole;
    } catch {
      // fallback
    }
  }

  // Get user from DB if exists
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  const displayUser = dbUser || {
    name: userName,
    email: userEmail,
    role: userRole,
    createdAt: new Date(),
  };

  const isManager = displayUser.role === "MANAGER";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account credentials and system privileges</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-white rounded-2xl p-1.5 shadow-lg border border-slate-100 flex items-center justify-center">
              <div className="w-full h-full bg-indigo-50 text-indigo-700 font-extrabold text-2xl rounded-xl flex items-center justify-center">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="pt-14 pb-8 px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{displayUser.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                <Mail size={16} />
                <span>{displayUser.email}</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
                isManager
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              <ShieldCheck size={14} />
              {isManager ? "Inventory Manager" : "Warehouse Staff"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Role</span>
              <p className="text-base font-semibold text-slate-800">
                {isManager ? "Inventory Manager" : "Warehouse Staff"}
              </p>
              <p className="text-xs text-slate-500">
                {isManager
                  ? "Authorized to create products, set reorder points, validate deliveries, and approve adjustments."
                  : "Authorized to conduct physical counts, execute transfers, pick, and shelf incoming goods."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Member Since</span>
              <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <Calendar size={16} className="text-slate-500" />
                {new Date(displayUser.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <p className="text-xs text-slate-500">Active status with full ERP synchronization</p>
            </div>
          </div>

          {/* Role Responsibilities Checklist */}
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
            <h3 className="font-semibold text-sm text-indigo-950 mb-3">Assigned Responsibilities & Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Real-time stock visibility across all warehouses
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Receive vendor PO shipments & update inventory
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Execute internal transfers between racks/locations
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Physical count verification & stock adjustments
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Pick & pack outgoing customer delivery orders
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-600" /> Generate audit trails & stock movement ledger
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
