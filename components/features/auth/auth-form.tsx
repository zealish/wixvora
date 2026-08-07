"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { registerClient } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthHeader } from "./auth-header";
import { AuthFooter } from "./auth-footer";
import { AuthShowcase } from "./auth-showcase";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const isSignIn = mode === "signin";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isSignIn) {
        const result = await signIn.email({
          email,
          password,
          rememberMe: formData.get("remember") === "on",
        });

        if (result.error) {
          setError(result.error.message ?? "Invalid email or password");
          setLoading(false);
          return;
        }

        setSuccess("Welcome back! Redirecting...");
        
        const sessionResponse = await fetch("/api/auth/get-session");
        const sessionData = await sessionResponse.json();
        const redirectPath = sessionData?.user?.accountType === "STAFF" ? "/staff" : "/client";

        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1500);
      } else {
        const name = formData.get("name") as string;
        const result = await registerClient({ name, email, password });

        if (result.success) {
          setSuccess("Account created! Redirecting to verify email...");
          setTimeout(() => {
            router.push("/verify-email");
          }, 1500);
        } else {
          setError(result.error);
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "Too Short", color: "text-slate-400", bars: 0 };
    if (password.length < 6) return { label: "Weak", color: "text-rose-500", bars: 1 };
    if (password.length < 10) return { label: "Medium", color: "text-amber-500", bars: 2 };
    return { label: "Strong", color: "text-emerald-600", bars: 3 };
  };

  const strength = !isSignIn ? getPasswordStrength() : null;

  return (
    <>
      <AuthHeader />

      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Glowing orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 animate-pulse-glow rounded-full bg-brand-500/10 blur-3xl"></div>
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 animate-pulse-glow rounded-full bg-purple-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Showcase */}
            <AuthShowcase />

            {/* Right Column: Auth Card */}
            <div className="lg:col-span-6">
              <div className="glow-effect relative rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                {/* Header */}
                <div className="mb-6 text-center sm:text-left">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {isSignIn ? "Welcome Back" : "Create an Account"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {isSignIn
                      ? "Please enter your details to sign in to your workspace."
                      : "Start building stunning websites with AI in under a minute."}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="mb-6 flex items-center rounded-2xl border border-slate-200/60 bg-slate-100/90 p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all sm:text-sm ${
                      isSignIn
                        ? "bg-white text-slate-900 shadow-sm"
                        : "font-semibold text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all sm:text-sm ${
                      !isSignIn
                        ? "bg-white text-slate-900 shadow-sm"
                        : "font-semibold text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Success/Error Alert */}
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

                {/* Social Auth */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="card-shadow flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="card-shadow flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6 flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="mx-4 flex-shrink text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    or with email
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name - Sign Up Only */}
                  {!isSignIn && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="text"
                          name="name"
                          required
                          placeholder="John Doe"
                          disabled={loading}
                          className="h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        required
                        placeholder="name@company.com"
                        disabled={loading}
                        className="h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      {isSignIn && (
                        <a
                          href="/forgot-password"
                          className="text-xs font-bold text-brand-600 transition-colors hover:text-brand-700"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="••••••••"
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-auto w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-12 text-sm font-medium text-slate-900 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength - Sign Up Only */}
                  {!isSignIn && strength && (
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
                  )}

                  {/* Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer select-none items-center gap-2">
                      <Checkbox
                        name="remember"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                      />
                      <span className="text-xs font-semibold text-slate-600">
                        {isSignIn
                          ? "Remember me for 30 days"
                          : "I agree to Terms & Privacy Policy"}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-300 active:scale-95"
                  >
                    <span>
                      {loading
                        ? "Authenticating..."
                        : isSignIn
                        ? "Sign In to Dashboard"
                        : "Create Free Account"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                {/* Footer Security */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>256-bit SSL Encryption • Enterprise Grade Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </>
  );
}
