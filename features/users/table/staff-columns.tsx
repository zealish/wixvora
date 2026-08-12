"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithProfile } from "@/features/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export const createStaffColumns = (
  onViewStaff: (staff: UserWithProfile) => void
): ColumnDef<UserWithProfile, unknown>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
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
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Name",
      filterVariant: "text",
      searchable: true,
      exportable: true,
      visibleFrom: "always",
      minWidth: 140,
      maxWidth: 260,
      truncate: true,
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Email",
      filterVariant: "text",
      searchable: true,
      copyable: true,
      exportable: true,
      minWidth: 180,
      maxWidth: 300,
      truncate: true,
    },
  },
  {
    id: "department",
    accessorFn: (row) => row.staff?.department ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Department",
      filterVariant: "select",
      exportable: true,
      minWidth: 120,
      truncate: true,
    },
  },
  {
    id: "position",
    accessorFn: (row) => row.staff?.position ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    enableSorting: true,
    meta: {
      label: "Position",
      exportable: true,
      minWidth: 120,
      truncate: true,
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.staff?.employmentStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value === "ACTIVE" ? "default" : "secondary"}>
          {value}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Status",
      filterVariant: "select",
      exportable: true,
      align: "center",
      visibleFrom: "always",
      minWidth: 100,
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const u = row.original;

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
            <DropdownMenuItem onClick={() => onViewStaff(u)}>
              <Eye className="mr-2 size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href={`/staff/staffs/${u.id}/edit`} />}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log("Delete user:", u.id);
              }}
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
