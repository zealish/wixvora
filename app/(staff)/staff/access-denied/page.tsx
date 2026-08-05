import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AccessDeniedPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe you should have access to this page, please contact your administrator.
          </p>
          <Link href="/staff">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
