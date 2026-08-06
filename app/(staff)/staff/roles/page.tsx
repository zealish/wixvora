import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getRolesWithPermissions } from "@/features/roles/service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

export default async function RolesPage() {
  try {
    await authorize(PERMISSIONS.ROLES_VIEW);
  } catch {
    redirect("/staff/access-denied");
  }

  const roles = await getRolesWithPermissions();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Roles</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Link key={role.id} href={`/staff/roles/${role.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>
                  {role.description || role.code}
                </CardDescription>
                <p className="text-muted-foreground mt-2 text-sm">
                  {role.permissions.length} permission
                  {role.permissions.length !== 1 ? "s" : ""}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
