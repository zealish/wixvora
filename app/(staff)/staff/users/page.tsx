import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllStaffUsers } from "@/features/users/queries";
import { UserTable } from "./components/user-table";
import { PageHeader } from "@/components/shared/page-header";

export default async function UsersPage() {
  try {
    await authorize(PERMISSIONS.USERS_VIEW);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const users = await getAllStaffUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Users"
        description="Manage staff accounts, roles, and permissions"
        actions={
          <Link href="/staff/users/create">
            <Button>
              <UserPlus />
              Create Staff
            </Button>
          </Link>
        }
      />

      <UserTable users={users} />
    </div>
  );
}
