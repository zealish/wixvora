'use client';

import { useState, useTransition } from 'react';
import { updateRolePermissionsAction } from '@/features/roles/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Permission {
  id: string;
  key: string;
  resource: string;
  action: string;
  scope: string | null;
  description: string | null;
}

interface RolePermissionFormProps {
  roleId: string;
  rolePermissions: Permission[];
  allPermissions: Permission[];
}

export function RolePermissionForm({
  roleId,
  rolePermissions,
  allPermissions,
}: RolePermissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(rolePermissions.map((p) => p.id))
  );
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateRolePermissionsAction({
        roleId,
        permissionIds: Array.from(selectedPermissions),
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to update permissions');
      }
    });
  };

  const groupedPermissions = allPermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource]!.push(permission);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{resource}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perms.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => handleToggle(permission.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{permission.key}</p>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </form>
  );
}
