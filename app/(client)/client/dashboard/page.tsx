import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getWebsitesByUserId } from "@/features/websites/queries";
import WebsiteList from "@/components/dashboard/website-list";

export const metadata: Metadata = {
  title: "My Websites",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const websites = await getWebsitesByUserId(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Websites</h1>
          <p className="text-muted-foreground">
            Manage your websites and create new ones.
          </p>
        </div>
        <Link
          href="/dashboard/websites/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Create New Website
        </Link>
      </div>

      <WebsiteList websites={websites} />
    </div>
  );
}
