"use client";

import { useState, useMemo } from "react";
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
import { createCategoryColumns } from "../table/category-columns";
import { createCategoryBulkActions } from "../table/category-bulk-actions-config";
import { categoryFilters } from "../table/category-filters";
import { deleteCategoryAction, toggleStatusAction } from "../actions";
import type { CategoryWithChildren } from "../types";

interface CategoryDataTableProps {
  data: CategoryWithChildren[];
}

export function CategoryDataTable({ data }: CategoryDataTableProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    hasChildren: boolean;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const flattenData = useMemo(() => {
    const flat: (CategoryWithChildren & { depth: number })[] = [];

    const traverse = (cats: CategoryWithChildren[], depth: number = 0) => {
      for (const cat of cats) {
        flat.push({ ...cat, depth });

        // Only traverse children if current item is expanded
        if (
          cat.children &&
          cat.children.length > 0 &&
          expandedIds.has(cat.id)
        ) {
          traverse(cat.children, depth + 1);
        }
      }
    };

    traverse(data);
    return flat;
  }, [data, expandedIds]);

  const handleEdit = (id: string) => {
    router.push(`/staff/business-categories/${id}/edit`);
  };

  const handleAddSubCategory = (parentId: string) => {
    router.push(`/staff/business-categories/${parentId}/create-sub`);
  };

  const handleDelete = (id: string, hasChildren: boolean) => {
    setDeleteTarget({ id, hasChildren });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteCategoryAction(deleteTarget.id);
    if (result.success) {
      toast.add({
        type: "success",
        title: "Success",
        description: "Category deleted successfully",
      });
      router.refresh();
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: result.error || "Failed to delete category",
      });
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await toggleStatusAction(id, newStatus);
    if (result.success) {
      const message =
        newStatus === "inactive"
          ? "Status changed to inactive (children also set to inactive)"
          : `Status changed to ${newStatus}`;

      toast.add({
        type: "success",
        title: "Success",
        description: message,
      });
      router.refresh();
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: result.error || "Failed to toggle status",
      });
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const columns = createCategoryColumns(
    expandedIds,
    toggleExpand,
    handleEdit,
    handleDelete,
    handleAddSubCategory,
    handleToggleStatus
  );

  const bulkActions = createCategoryBulkActions(handleRefresh);

  return (
    <>
      <DataTable
        tableId="business-categories"
        data={flattenData}
        columns={columns}
        rowId={(row) => row.id}
        search={{
          keys: ["name", "slug"],
          placeholder: "Search categories...",
        }}
        filters={categoryFilters}
        bulkActions={bulkActions}
        exportOptions={{
          csv: true,
          excel: true,
          filename: "business-categories",
        }}
        enabledFeatures={{
          sorting: true,
          filtering: true,
          pagination: false,
          export: true,
          rowSelection: true,
          columnVisibility: true,
        }}
        locale={{
          searchPlaceholder: "Search categories...",
          noResults: "No categories found.",
          rowsSelected: (count) => `${count} selected`,
        }}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              {deleteTarget?.hasChildren
                ? "This category has sub-categories that will also be deleted. This action cannot be undone."
                : "Are you sure you want to delete this category? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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
