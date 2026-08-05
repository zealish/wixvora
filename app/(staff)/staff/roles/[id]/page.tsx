import { authorize } from '@/lib/auth/authorize';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { redirect, notFound } from 'next/navigation';
import { getRoleById, getAllPermissions } from '@/features/roles/service';
import { RolePermissionForm } from './components/role-permission-form';

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await authorize(PERMISSIONS.ROLES_MANAGE);
  } catch {
    redirect('/staff/access-denied');
  }

  const { id } = await params;
  const [role, allPermissions] = await Promise.all([
    getRoleById(id),
    getAllPermissions(),
  ]);

  if (!role) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">{role.name}</h1>
      <p className="text-muted-foreground mb-6">
        {role.description || role.code}
      </p>
      
      <RolePermissionForm
        roleId={role.id}
        rolePermissions={role.permissions}
        allPermissions={allPermissions}
      />
    </div>
  );
}
