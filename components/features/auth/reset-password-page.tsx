"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthHeader } from "@/components/features/auth/auth-header";
import { AuthFooter } from "@/components/features/auth/auth-footer";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam === "INVALID_TOKEN") {
      setError("Invalid or expired reset link");
    } else if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("No reset token found");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);

      if (result.success) {
        router.push("/login?reset=success");
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const getPasswordStrength = () => {
    if (newPassword.length === 0)
      return { label: "Too Short", color: "text-slate-400", bars: 0 };
    if (newPassword.length < 6)
      return { label: "Weak", color: "text-rose-500", bars: 1 };
    if (newPassword.length < 10)
      return { label: "Medium", color: "text-amber-500", bars: 2 };
    return { label: "Strong", color: "text-emerald-600", bars: 3 };
  };

  const strength = getPasswordStrength();

  if (error && !token) {
    return (
      <>
        <AuthHeader />
        <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-pulse-glow bg-brand-500/10 pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"></div>
          <div
            className="animate-pulse-glow pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="relative z-10 w-full max-w-md">
            <div className="glow-effect rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 shadow-xl shadow-rose-200">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Invalid reset link
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  This password reset link is invalid or has expired
                </p>
              </div>

              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
                {error}
              </div>

              <Link href="/forgot-password">
                <Button className="via-brand-600 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-300 active:scale-95">
                  Request new reset link
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/login"
                className="text-brand-600 hover:text-brand-700 mt-6 block text-center text-sm font-bold transition-colors"
              >
                Return to login
              </Link>
            </div>
          </div>
        </main>
        <AuthFooter />
      </>
    );
  }

  return (
    <>
      <AuthHeader />
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="animate-pulse-glow bg-brand-500/10 pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"></div>
        <div
          className="animate-pulse-glow pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="glow-effect rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 shadow-xl shadow-indigo-200">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                  ✕
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-slate-600">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    minLength={8}
                    className="focus:border-brand-500 focus:ring-brand-500/10 h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pr-12 pl-11 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:ring-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Password strength</span>
                  <span className={`font-bold ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full w-1/3 rounded-full transition-all ${
                      strength.bars >= 1 ? "bg-rose-500" : "bg-slate-200"
                    } ${strength.bars >= 2 ? "bg-amber-500" : ""} ${
                      strength.bars >= 3 ? "bg-emerald-500" : ""
                    }`}
                  ></div>
                  <div
                    className={`h-full w-1/3 rounded-full transition-all ${
                      strength.bars >= 2
                        ? strength.bars >= 3
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                        : "bg-slate-200"
                    }`}
                  ></div>
                  <div
                    className={`h-full w-1/3 rounded-full transition-all ${
                      strength.bars >= 3 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    minLength={8}
                    className="focus:border-brand-500 focus:ring-brand-500/10 h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pr-12 pl-11 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:ring-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="via-brand-600 mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-300 active:scale-95"
              >
                <span>{loading ? "Resetting..." : "Reset password"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <Link
              href="/login"
              className="text-brand-600 hover:text-brand-700 mt-6 block text-center text-sm font-bold transition-colors"
            >
              Back to login
            </Link>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>256-bit SSL Encryption • Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </main>
      <AuthFooter />
    </>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
