"use client";

import { Trash2 } from "lucide-react";
import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";

export const clientBulkActions: DataTableBulkAction<UserWithProfile>[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      console.log(
        "Delete clients:",
        rows.map((r) => r.id)
      );
    },
  },
];
