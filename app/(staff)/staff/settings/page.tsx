import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStaffByUserId } from "@/features/users/queries";
import { getSeoSettings } from "@/features/settings/service";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata = {
  title: "Settings | Staff",
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.accountType !== "STAFF") {
    redirect("/staff/access-denied");
  }

  const staff = await getStaffByUserId(session.user.id);
  if (!staff) {
    redirect("/staff/access-denied");
  }

  const isSuperAdmin = staff.roles.some(
    (role: { code: string }) => role.code === "SUPER_ADMIN"
  );
  if (!isSuperAdmin) {
    redirect("/staff/access-denied");
  }

  const seoSettings = await getSeoSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </div>
      <SettingsTabs seoSettings={seoSettings} />
    </div>
  );
}
