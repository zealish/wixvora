import { redirect, notFound } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getStaffUserById } from "@/features/users/queries";
import { StaffEditForm } from "@/features/user-management/components";

interface EditStaffPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  try {
    await authorize(PERMISSIONS.USERS_UPDATE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const { id } = await params;
  const staff = await getStaffUserById(id);

  if (!staff) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Staff User</h1>
        <p className="text-muted-foreground mt-2">
          Update information for {staff.name}
        </p>
      </div>
      <StaffEditForm staff={staff} />
    </div>
  );
}
