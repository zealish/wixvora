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
import { resendVerificationEmail } from "@/features/auth/actions";
import { toast } from "@/components/ui/toast";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.add({
        type: "error",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resendVerificationEmail(email);

      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description: "Verification email has been sent",
        });
        setEmail("");
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to resend verification email",
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification email to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Please check your email and click the verification link to activate
            your account.
          </p>
          <p className="text-muted-foreground text-sm">
            If you don&apos;t see the email, check your spam folder.
          </p>

          <div className="border-t pt-4">
            <div className="space-y-3">
              <Label htmlFor="email">Resend verification email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={handleResend}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Resend Email"}
              </Button>
            </div>
          </div>

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
