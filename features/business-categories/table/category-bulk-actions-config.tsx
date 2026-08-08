"use client";

import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { CategoryWithChildren } from "../types";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  deleteCategoryAction,
  toggleStatusAction,
} from "../actions";

export const createCategoryBulkActions = (
  onRefresh: () => void
): DataTableBulkAction<CategoryWithChildren>[] => [
  {
    id: "activate",
    label: "Activate",
    icon: ToggleRight,
    variant: "default",
    onAction: async ({ rows }) => {
      const promises = rows.map((row) => toggleStatusAction(row.id, "active"));
      const results = await Promise.all(promises);
      
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        toast.add({
          type: "success",
          title: "Success",
          description: `${rows.length} categories activated`,
        });
        onRefresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: `${failures.length} categories failed to activate`,
        });
      }
    },
  },
  {
    id: "deactivate",
    label: "Deactivate",
    icon: ToggleLeft,
    variant: "default",
    onAction: async ({ rows }) => {
      const promises = rows.map((row) => toggleStatusAction(row.id, "inactive"));
      const results = await Promise.all(promises);
      
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        toast.add({
          type: "success",
          title: "Success",
          description: `${rows.length} categories deactivated`,
        });
        onRefresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: `${failures.length} categories failed to deactivate`,
        });
      }
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      const promises = rows.map((row) => deleteCategoryAction(row.id));
      const results = await Promise.all(promises);
      
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        toast.add({
          type: "success",
          title: "Success",
          description: `${rows.length} categories deleted`,
        });
        onRefresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: `${failures.length} categories failed to delete`,
        });
      }
    },
  },
];
