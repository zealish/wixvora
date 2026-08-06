import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getClientByUserId } from "@/features/clients/queries";
import { ProfileForm } from "./components/profile-form";

export default async function ClientProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await getClientByUserId(session.user.id);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
