"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaffAction } from "@/features/users/actions";

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface UserFormProps {
  roles: Role[];
}

export function UserForm({ roles }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleId]);
    } else {
      setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      roleIds: selectedRoles,
    };

    startTransition(async () => {
      const result = await createStaffAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/staff/users");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" name="position" />
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={selectedRoles.includes(role.id)}
                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor={`role-${role.id}`} className="text-sm">
                {role.name}
                {role.description && (
                  <span className="text-muted-foreground">
                    {" "}
                    - {role.description}
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isPending || selectedRoles.length === 0}
        >
          {isPending ? "Creating..." : "Create Staff"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/users")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
