"use client";

import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { TemplateListItem } from "../types";
import { Rocket, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  setTemplateStatusAction,
  setTemplateFeaturedAction,
  deleteTemplateAction,
} from "../actions";

export const createTemplateBulkActions = (
  onRefresh: () => void
): DataTableBulkAction<TemplateListItem>[] => [
  {
    id: "publish",
    label: "Publish",
    icon: Rocket,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateStatusAction(row.id, "published"))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "published with success",
        onRefresh
      );
    },
  },
  {
    id: "unpublish",
    label: "Unpublish",
    icon: EyeOff,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateStatusAction(row.id, "draft"))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "unpublished",
        onRefresh
      );
    },
  },
  {
    id: "feature",
    label: "Mark as Featured",
    icon: Star,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateFeaturedAction(row.id, true))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "marked as featured",
        onRefresh
      );
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => deleteTemplateAction(row.id))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "deleted",
        onRefresh
      );
    },
  },
];

function report(
  total: number,
  succeeded: number,
  verb: string,
  onRefresh: () => void
): void {
  const failed = total - succeeded;
  if (succeeded > 0) {
    toast.add({
      type: "success",
      title: "Success",
      description: `${succeeded} template${succeeded === 1 ? "" : "s"} ${verb}`,
    });
  }
  if (failed > 0) {
    toast.add({
      type: "error",
      title: "Error",
      description: `${failed} template${failed === 1 ? "" : "s"} failed`,
    });
  }
  onRefresh();
}
