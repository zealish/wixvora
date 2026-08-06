import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllClientUsers } from "@/features/users/queries";
import { ClientDataTable } from "@/features/user-management/components";
import { PageHeader } from "@/components/shared/page-header";

export default async function ClientsPage() {
  try {
    await authorize(PERMISSIONS.CLIENTS_VIEW);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const users = await getAllClientUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Users"
        description="Manage client accounts and access"
        actions={
          <Link href="/staff/clients/create">
            <Button>
              <UserPlus />
              Create Client
            </Button>
          </Link>
        }
      />

      <ClientDataTable users={users} />
    </div>
  );
}
