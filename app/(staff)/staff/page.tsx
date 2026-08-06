import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name}
        </p>
      </div>
    </div>
  );
}
