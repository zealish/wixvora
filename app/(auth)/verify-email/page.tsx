import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function VerifyEmailPage() {
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
