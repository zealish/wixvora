import { redirect } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllRoles } from "@/features/users/queries";
import { UserForm } from "../components/user-form";

export default async function CreateUserPage() {
  try {
    await authorize(PERMISSIONS.USERS_CREATE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const roles = await getAllRoles();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Staff User</h1>
      <UserForm roles={roles} />
    </div>
  );
}
