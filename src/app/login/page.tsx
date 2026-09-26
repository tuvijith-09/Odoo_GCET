"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  signInAction,
  signUpAction,
  requestOtpAction,
  resetPasswordWithOtpAction,
} from "@/app/actions";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password OTP flow state
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [generatedOtpDemo, setGeneratedOtpDemo] = useState<string | null>(null);

  // Handle Sign In
  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signInAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Sign Up
  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signUpAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign up.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Request OTP
  async function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    try {
      const res = await requestOtpAction(email);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setForgotEmail(email);
        setGeneratedOtpDemo(res?.otp || null);
        setForgotStep("verify");
        toast.success("OTP sent to your email!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to request OTP.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Reset Password with OTP
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp") as string;
    const newPassword = formData.get("newPassword") as string;
    try {
      const res = await resetPasswordWithOtpAction(forgotEmail, otp, newPassword);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Password reset successfully! Please sign in.");
        setMode("signin");
        setForgotStep("request");
        setGeneratedOtpDemo(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 backdrop-blur rounded-xl border border-indigo-400/30">
            <Package className="h-7 w-7 text-indigo-300" />
          </div>
          <span className="text-2xl font-bold tracking-tight">StockSense</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-medium text-indigo-200">
            <ShieldCheck size={14} /> Modular Inventory Management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Streamline your inventory & stock operations in real time.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Replace manual registers and Excel sheets. Manage receipts, deliveries, internal transfers, and physical stock count adjustments with a centralized, intuitive interface.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-700/50 text-sm">
            <div>
              <p className="font-semibold text-white">Inventory Managers</p>
              <p className="text-xs text-indigo-300 mt-0.5">Control incoming & outgoing stock, reordering rules & KPIs</p>
            </div>
            <div>
              <p className="font-semibold text-white">Warehouse Staff</p>
              <p className="text-xs text-indigo-300 mt-0.5">Execute transfers, picking, shelving, and stock counting</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-300">
          StockSense IMS © {new Date().getFullYear()} • Enterprise Ready
        </div>
      </div>

      {/* Right panel - authentication forms */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900">StockSense</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode("signin"); setForgotStep("request"); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setForgotStep("request"); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === "forgot"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reset OTP
            </button>
          </div>

          {/* SIGN IN FORM */}
          {mode === "signin" && (
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-xs text-slate-500 mt-1">Sign in to your inventory workspace</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="admin@stocksense.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In to StockSense"}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Demo Credentials: Any email & password, or create an account
                </p>
              </div>
            </div>
          )}

          {/* SIGN UP FORM */}
          {mode === "signup" && (
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create an Account</h2>
                <p className="text-xs text-slate-500 mt-1">Join as an Inventory Manager or Warehouse Staff</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Alex Morgan"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role in Inventory *
                  </label>
                  <select
                    name="role"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="MANAGER">Inventory Manager (Supervision, Rules & Approvals)</option>
                    <option value="STAFF">Warehouse Staff (Transfers, Picking & Shelving)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Sign Up & Open Dashboard"}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD / OTP FLOW */}
          {mode === "forgot" && (
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="text-indigo-600" size={20} /> OTP Password Reset
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {forgotStep === "request"
                    ? "Enter your email to receive a 6-digit one-time password"
                    : `Enter the 6-digit OTP code sent to ${forgotEmail}`}
                </p>
              </div>

              {generatedOtpDemo && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                  <span>Demo OTP Code: <strong>{generatedOtpDemo}</strong></span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedOtpDemo)}
                    className="underline text-amber-700 font-semibold"
                  >
                    Copy
                  </button>
                </div>
              )}

              {forgotStep === "request" ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? "Generating OTP..." : "Send Reset OTP"}
                    {!isLoading && <ArrowRight size={16} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      6-Digit OTP Code *
                    </label>
                    <input
                      type="text"
                      name="otp"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      defaultValue={generatedOtpDemo || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono tracking-widest text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        name="newPassword"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? "Resetting..." : "Confirm & Reset Password"}
                    {!isLoading && <CheckCircle2 size={16} />}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setForgotStep("request")}
                      className="text-xs text-slate-500 hover:text-indigo-600"
                    >
                      ← Request a new OTP code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
