import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Package } from "lucide-react";

export default async function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) return;
    const cookieStore = await cookies();
    cookieStore.set("auth", JSON.stringify({ email }), { path: "/" });
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex-col justify-center items-center p-12">
        <Package className="h-20 w-20 mb-6 opacity-90" />
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">StockSense</h1>
        <p className="text-indigo-200 text-lg text-center max-w-md">
          Smart warehouse & inventory management. Track receipts, deliveries, internal transfers, and stock levels — all in one place.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-2">
            <Package className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-extrabold text-slate-900">StockSense</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1">Sign in to your inventory workspace</p>
          </div>
          <form action={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-sm text-slate-400">Demo: enter any email & password</p>
        </div>
      </div>
    </div>
  );
}
