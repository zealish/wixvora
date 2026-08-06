"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStaffAction } from "@/features/users/actions";
import type { UserWithProfile } from "@/features/users/types";

interface StaffEditFormProps {
  staff: UserWithProfile;
}

export function StaffEditForm({ staff }: StaffEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [employmentStatus, setEmploymentStatus] = useState<string>(
    staff.staff?.employmentStatus || "ACTIVE"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: staff.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      employmentStatus: employmentStatus as
        | "ACTIVE"
        | "INACTIVE"
        | "TERMINATED",
    };

    startTransition(async () => {
      const result = await updateStaffAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/staff/staffs");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={staff.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={staff.email}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          defaultValue={staff.staff?.department || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          name="position"
          defaultValue={staff.staff?.position || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employmentStatus">Employment Status</Label>
        <Select
          value={employmentStatus}
          onValueChange={(value) => {
            if (value) {
              setEmploymentStatus(value);
            }
          }}
        >
          <SelectTrigger id="employmentStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="TERMINATED">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/staffs")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
