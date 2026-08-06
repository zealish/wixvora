import { redirect } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ClientForm } from "@/features/user-management/components";

export default async function CreateClientPage() {
  try {
    await authorize(PERMISSIONS.CLIENTS_CREATE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Client User</h1>
      <ClientForm />
    </div>
  );
}
