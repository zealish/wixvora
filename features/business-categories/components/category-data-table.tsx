"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { getCategoryColumns } from "../table/category-columns";
import { CategoryBulkActions } from "../table/category-bulk-actions";
import { CategoryExportMenu } from "../table/category-export-menu";
import {
  deleteCategoryAction,
  toggleStatusAction,
} from "../actions";
import type { CategoryWithChildren } from "../types";

interface CategoryDataTableProps {
  data: CategoryWithChildren[];
}

export function CategoryDataTable({ data }: CategoryDataTableProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    hasChildren: boolean;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

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
    const flat: CategoryWithChildren[] = [];

    const filterCategory = (cat: CategoryWithChildren): boolean => {
      if (statusFilter !== "all" && cat.status !== statusFilter) return false;
      if (searchFilter) {
        const search = searchFilter.toLowerCase();
        if (
          !cat.name.toLowerCase().includes(search) &&
          !cat.slug.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    };

    const traverse = (cats: CategoryWithChildren[], parentId: string | null = null) => {
      for (const cat of cats) {
        if (parentId === null || expandedIds.has(parentId)) {
          if (filterCategory(cat)) {
            flat.push(cat);
          }
          if (cat.children && cat.children.length > 0) {
            traverse(cat.children, cat.id);
          }
        }
      }
    };

    traverse(data);
    return flat;
  }, [data, expandedIds, statusFilter, searchFilter]);

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
      toast.add({
        type: "success",
        title: "Success",
        description: `Status changed to ${newStatus}`,
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

  const handleBulkDelete = async (ids: string[]) => {
    const promises = ids.map((id) => deleteCategoryAction(id));
    const results = await Promise.all(promises);
    
    const failures = results.filter((r) => !r.success);
    if (failures.length === 0) {
      toast.add({
        type: "success",
        title: "Success",
        description: `${ids.length} categories deleted successfully`,
      });
      router.refresh();
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: `${failures.length} categories failed to delete`,
      });
    }
    setSelectedIds([]);
  };

  const handleBulkToggleStatus = async (
    ids: string[],
    status: "active" | "inactive"
  ) => {
    const promises = ids.map((id) => toggleStatusAction(id, status));
    const results = await Promise.all(promises);
    
    const failures = results.filter((r) => !r.success);
    if (failures.length === 0) {
      toast.add({
        type: "success",
        title: "Success",
        description: `${ids.length} categories updated to ${status}`,
      });
      router.refresh();
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: `${failures.length} categories failed to update`,
      });
    }
    setSelectedIds([]);
  };

  const columns = getCategoryColumns(
    expandedIds,
    toggleExpand,
    handleEdit,
    handleDelete,
    handleAddSubCategory,
    handleToggleStatus
  );

  const table = useReactTable({
    data: flattenData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      rowSelection: Object.fromEntries(selectedIds.map((id) => [id, true])),
    },
    onRowSelectionChange: (updater) => {
      const current = Object.fromEntries(selectedIds.map((id) => [id, true]));
      const newSelection =
        typeof updater === "function" ? updater(current) : updater;
      setSelectedIds(Object.keys(newSelection).filter((id) => newSelection[id]));
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search categories..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <CategoryExportMenu data={flattenData} selectedIds={selectedIds} />
        <CategoryBulkActions
          selectedIds={selectedIds}
          onDelete={handleBulkDelete}
          onToggleStatus={handleBulkToggleStatus}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
