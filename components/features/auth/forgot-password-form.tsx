"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/features/auth/actions";
import { toast } from "@/components/ui/toast";
import { KeyRound, Send, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setIsSubmitted(true);
        toast.add({
          type: "success",
          title: "Email sent",
          description: "Check your email for password reset instructions",
        });
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to send reset email",
        });
      }
    } catch (_error) {
      toast.add({
        type: "error",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Check your email
          </h1>
          <p className="text-base font-normal text-slate-600">
            We&apos;ve sent password reset instructions to your email
          </p>
        </div>

        <Card className="border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm">
          <CardContent className="space-y-5 pt-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                If an account exists with{" "}
                <span className="font-semibold text-indigo-600">{email}</span>,
                you will receive an email with instructions to reset your
                password.
              </p>
              <p className="text-sm text-slate-500">
                If you don&apos;t see the email, check your spam folder.
              </p>
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
          <KeyRound className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Forgot password?
        </h1>
        <p className="text-base font-normal text-slate-600">
          Enter your email address and we&apos;ll send you instructions
        </p>
      </div>

      <Card className="border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-8">
            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-12 rounded-xl border-slate-200 bg-white text-base transition-all focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-base font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send reset link"}
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
