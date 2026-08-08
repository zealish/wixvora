"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { UserWithProfile } from "@/features/users/types";
import { format } from "date-fns";

interface StaffViewModalProps {
  staff: UserWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffViewModal({
  staff,
  open,
  onOpenChange,
}: StaffViewModalProps) {
  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about the staff member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Name
              </h3>
              <p className="text-sm">{staff.name}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Email
              </h3>
              <p className="text-sm">{staff.email}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Account Type
              </h3>
              <Badge variant="outline">{staff.accountType}</Badge>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Employment Status
              </h3>
              <Badge
                variant={
                  staff.staff?.employmentStatus === "ACTIVE"
                    ? "default"
                    : "secondary"
                }
              >
                {staff.staff?.employmentStatus || "N/A"}
              </Badge>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Department
              </h3>
              <p className="text-sm">
                {staff.staff?.department || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Position
              </h3>
              <p className="text-sm">
                {staff.staff?.position || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                User ID
              </h3>
              <p className="font-mono text-sm text-xs">{staff.id}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Staff ID
              </h3>
              <p className="font-mono text-sm text-xs">
                {staff.staff?.id || (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </p>
            </div>

            <div className="col-span-2">
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Created At
              </h3>
              <p className="text-sm">
                {format(new Date(staff.createdAt), "PPpp")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
