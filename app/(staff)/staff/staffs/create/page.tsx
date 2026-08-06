import { redirect } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllRoles } from "@/features/users/queries";
import { StaffForm } from "@/features/user-management/components";

export default async function CreateStaffPage() {
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
      <StaffForm roles={roles} />
    </div>
  );
}
