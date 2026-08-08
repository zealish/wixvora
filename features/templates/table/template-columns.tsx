"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  Star,
  StarOff,
  ImageIcon,
  Pencil,
} from "lucide-react";
import type { TemplateListItem } from "../types";

interface TemplateColumnProps {
  onDuplicate: (template: TemplateListItem) => void;
  onDelete: (template: TemplateListItem) => void;
  onToggleFeatured: (template: TemplateListItem) => void;
}

function categoryText(row: TemplateListItem): string {
  if (!row.categoryName) return "-";
  const parent = row.categoryParentName ? `${row.categoryParentName} > ` : "";
  return `${parent}${row.categoryName}`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export function createTemplateColumns(
  opts: TemplateColumnProps
): ColumnDef<TemplateListItem, unknown>[] {
  const { onDuplicate, onDelete, onToggleFeatured } = opts;

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        exportable: false,
        visibleFrom: "always",
        minWidth: 40,
        cellClassName: "w-[40px]",
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-3">
            {t.previewImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.previewImageUrl}
                alt={t.name}
                className="h-10 w-10 rounded-md border object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md border">
                <ImageIcon className="text-muted-foreground h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 font-medium">
                {t.name}
                {t.isFeatured && (
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                )}
              </span>
              <span className="text-muted-foreground text-xs">{t.slug}</span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      meta: {
        label: "Name",
        searchable: true,
        exportable: true,
        visibleFrom: "always",
        minWidth: 240,
        truncate: true,
      },
    },
    {
      id: "category",
      accessorFn: (row) => categoryText(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {categoryText(row.original)}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Category",
        filterVariant: "select",
        exportable: true,
        minWidth: 180,
        truncate: true,
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const published = row.original.status === "published";
        return (
          <Badge variant={published ? "default" : "secondary"}>
            {published ? "Published" : "Draft"}
          </Badge>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        filterVariant: "select",
        exportable: true,
        visibleFrom: "always",
        minWidth: 110,
        align: "center",
      },
    },
    {
      id: "usage",
      accessorKey: "usageCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.usageCount}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "md",
        minWidth: 90,
        align: "center",
      },
    },
    {
      id: "createdBy",
      accessorKey: "createdByName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.createdByName ?? "-"}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "lg",
        minWidth: 140,
        truncate: true,
      },
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "lg",
        minWidth: 120,
        exportFormatter: (value) =>
          value instanceof Date ? value.toISOString() : String(value),
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/staff/templates/${t.id}/edit`} />}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFeatured(t)}>
                {t.isFeatured ? (
                  <StarOff className="mr-2 size-4" />
                ) : (
                  <Star className="mr-2 size-4" />
                )}
                {t.isFeatured ? "Remove Featured" : "Mark as Featured"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(t)}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(t)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      meta: {
        exportable: false,
        visibleFrom: "always",
        minWidth: 50,
        cellClassName: "w-[50px]",
      },
    },
  ];
}
