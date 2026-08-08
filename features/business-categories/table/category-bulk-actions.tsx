"use client";

import { Button } from "@/components/ui/button";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  onDelete: (ids: string[]) => void;
  onToggleStatus: (ids: string[], status: "active" | "inactive") => void;
}

export function CategoryBulkActions({
  selectedIds,
  onDelete,
  onToggleStatus,
}: BulkActionsProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">
        {selectedIds.length} selected
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(selectedIds, "active")}
      >
        <ToggleRight className="mr-1 h-4 w-4" />
        Activate
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(selectedIds, "inactive")}
      >
        <ToggleLeft className="mr-1 h-4 w-4" />
        Deactivate
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(selectedIds)}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
