"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/features/auth/actions";
import { toast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
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
    } catch (error) {
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              If an account exists with {email}, you will receive an email with
              instructions to reset your password.
            </p>
            <p className="text-muted-foreground text-sm">
              If you don&apos;t see the email, check your spam folder.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="text-primary text-sm hover:underline"
              >
                Return to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you instructions to
            reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardContent className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-muted-foreground text-sm hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
