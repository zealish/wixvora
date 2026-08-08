"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerClient } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      companyName: (formData.get("companyName") as string) || undefined,
    };

    const result = await registerClient(data);

    if (result.success) {
      router.push("/verify-email");
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Create an account
        </h1>
        <p className="text-base font-normal text-slate-600">
          Enter your details to get started
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
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-slate-700"
              >
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                placeholder="John Doe"
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
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
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </Label>
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
            <div className="space-y-2.5">
              <Label
                htmlFor="companyName"
                className="text-sm font-semibold text-slate-700"
              >
                Company Name <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                disabled={loading}
                placeholder="Acme Inc."
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-base font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <p className="text-center text-sm font-medium text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
