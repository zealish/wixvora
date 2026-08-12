"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/features/auth/actions";
import { toast } from "@/components/ui/toast";
import { Lock, AlertCircle } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const token = searchParams.get("token") || null;

  const paramError = (() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "INVALID_TOKEN") return "Invalid or expired reset link";
    if (!searchParams.get("token")) return "No reset token provided";
    return null;
  })();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setFormError("No reset token found");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(token, newPassword);

      if (result.success) {
        toast.add({
          type: "success",
          title: "Password reset successful",
          description: "You can now login with your new password",
        });
        router.push("/login");
      } else {
        setFormError(result.error || "Failed to reset password");
      }
    } catch (_err) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (paramError) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Invalid reset link
          </h1>
          <p className="text-base font-normal text-slate-600">
            This password reset link is invalid or has expired
          </p>
        </div>

        <Card className="border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm">
          <CardContent className="space-y-5 pt-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
              {paramError}
            </div>
            <div className="flex flex-col space-y-3">
              <Link href="/forgot-password">
                <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-base font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]">
                  Request new reset link
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm font-medium text-slate-600">
          <Link
            href="/login"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Return to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-indigo-500/30">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="text-base font-normal text-slate-600">
          Enter your new password below
        </p>
      </div>

      <Card className="border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-8">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}
            <div className="space-y-2.5">
              <Label
                htmlFor="newPassword"
                className="text-sm font-semibold text-slate-700"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-base font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <p className="text-center text-sm font-medium text-slate-600">
        <Link
          href="/login"
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
