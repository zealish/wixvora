import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ClientDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and view your account information.
        </p>
      </div>
    </div>
  );
}
