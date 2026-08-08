"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { DataTable } from "@/components/shared/data-table";
import { createTemplateColumns } from "../table/template-columns";
import { templateFilters } from "../table/template-filters";
import { createTemplateBulkActions } from "../table/template-bulk-actions";
import {
  deleteTemplateAction,
  duplicateTemplateAction,
  setTemplateFeaturedAction,
} from "../actions";
import type { TemplateListItem } from "../types";

interface TemplateDataTableProps {
  data: TemplateListItem[];
}

export function TemplateDataTable({ data }: TemplateDataTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<TemplateListItem | null>(
    null
  );

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDuplicate = useCallback(
    async (template: TemplateListItem) => {
      const result = await duplicateTemplateAction(template.id);
      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description: "Template duplicated",
        });
        router.refresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to duplicate template",
        });
      }
    },
    [router]
  );

  const handleToggleFeatured = useCallback(
    async (template: TemplateListItem) => {
      const result = await setTemplateFeaturedAction(
        template.id,
        !template.isFeatured
      );
      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description: template.isFeatured
            ? "Removed from featured"
            : "Marked as featured",
        });
        router.refresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to update template",
        });
      }
    },
    [router]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteTemplateAction(deleteTarget.id);
    if (result.success) {
      toast.add({
        type: "success",
        title: "Success",
        description: "Template deleted",
      });
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: result.error || "Failed to delete template",
      });
    }
    setDeleteTarget(null);
    router.refresh();
  }, [deleteTarget, router]);

  const columns = useMemo(
    () =>
      createTemplateColumns({
        onDuplicate: handleDuplicate,
        onDelete: (t) => setDeleteTarget(t),
        onToggleFeatured: handleToggleFeatured,
      }),
    [handleDuplicate, handleToggleFeatured]
  );

  const bulkActions = useMemo(
    () => createTemplateBulkActions(handleRefresh),
    [handleRefresh]
  );

  return (
    <>
      <DataTable
        tableId="website-templates"
        data={data}
        columns={columns}
        rowId={(row) => row.id}
        search={{ keys: ["name", "slug"], placeholder: "Search templates..." }}
        filters={templateFilters}
        bulkActions={bulkActions}
        exportOptions={{
          csv: true,
          excel: true,
          filename: "website-templates",
        }}
        enabledFeatures={{
          sorting: true,
          filtering: true,
          pagination: true,
          export: true,
          rowSelection: true,
          columnVisibility: true,
        }}
        locale={{
          searchPlaceholder: "Search templates...",
          noResults: "No templates found.",
          rowsSelected: (count) => `${count} selected`,
        }}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.name}"` : " this template"}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
