"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/features/auth/auth-header";
import { AuthFooter } from "@/components/features/auth/auth-footer";
import Link from "next/link";

export function VerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleResend() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resendVerificationEmail(email);

      if (result.success) {
        setSuccess("Verification email has been sent");
        setEmail("");
      } else {
        setError(result.error || "Failed to resend verification email");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeader />
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 animate-pulse-glow rounded-full bg-brand-500/10 blur-3xl"></div>
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 animate-pulse-glow rounded-full bg-purple-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="glow-effect rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 shadow-xl shadow-indigo-200">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Verify your email</h2>
              <p className="mt-1 text-sm text-slate-500">
                We&apos;ve sent a verification email to your inbox
              </p>
            </div>

            <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Please check your email and click the verification link to activate your account.
              </p>
              <p className="text-xs text-slate-600">
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>

            {(success || error) && (
              <div
                className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium transition-all ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white ${
                    success ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  {success ? "✓" : "✕"}
                </div>
                <div>
                  <p className="font-bold">{success ? "Success!" : "Error"}</p>
                  <p className="text-slate-600">{success || error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Resend verification email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                  />
                </div>
              </div>

              <Button
                onClick={handleResend}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-300 active:scale-95"
              >
                <span>{loading ? "Sending..." : "Resend Email"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <Link href="/login" className="mt-6 block text-center text-sm font-bold text-brand-600 transition-colors hover:text-brand-700">
              Return to login
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
