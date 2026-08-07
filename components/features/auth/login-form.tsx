"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      const result = await signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password"
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-base font-normal text-slate-600">
          Log in to your account to continue
        </p>
      </div>

      <Card className="border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                placeholder="john@example.com"
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="flex items-center space-x-2.5">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                disabled={loading}
                defaultChecked
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-medium text-slate-700"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-base font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <p className="text-center text-sm font-medium text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
