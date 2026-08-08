"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLogWithUser } from "@/features/audit/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import { format } from "date-fns";
import { UserCircle } from "lucide-react";

function getActionBadgeColor(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "bg-green-100 text-green-800";
  if (["updated"].includes(actionLower)) return "bg-blue-100 text-blue-800";
  if (["deleted"].includes(actionLower)) return "bg-red-100 text-red-800";
  if (["login"].includes(actionLower)) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

export function formatActionEmoji(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "🟢";
  if (["updated"].includes(actionLower)) return "🔵";
  if (["deleted"].includes(actionLower)) return "🔴";
  if (["login"].includes(actionLower)) return "🟣";
  if (["logout"].includes(actionLower)) return "🟤";
  return "⚪";
}

function formatTimestamp(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a");
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return formatTimestamp(date);
}

function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const cleaned = userAgent
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-()\/.]/g, "")
    .trim();
  return truncateString(cleaned, 40);
}

function truncateIP(ip: string | null): { display: string; full: string } {
  if (!ip) return { display: "Unknown", full: "" };
  if (ip.length <= 15) return { display: ip, full: ip };
  return {
    display: `${ip.slice(0, 6)}...${ip.slice(-4)}`,
    full: ip,
  };
}

function formatEntity(entity: string, entityId: string | null): string {
  if (!entityId) return entity;
  return `${entity} #${truncateString(entityId, 12)}`;
}

export const createAuditLogColumns = (
  onRowClick: (log: AuditLogWithUser) => void
): ColumnDef<AuditLogWithUser, unknown>[] => [
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
        onClick={(e) => e.stopPropagation()}
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
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => (
      <div className="space-y-0.5" onClick={() => onRowClick(row.original)}>
        <div className="font-medium">
          {formatTimestamp(row.original.createdAt)}
        </div>
        <div className="text-xs text-muted-foreground">
          ({formatRelativeTime(row.original.createdAt)})
        </div>
      </div>
    ),
    enableSorting: true,
    meta: {
      label: "Timestamp",
      exportable: true,
      visibleFrom: "always",
      minWidth: 150,
      exportFormatter: (value) => 
        value instanceof Date ? value.toISOString() : String(value),
    },
  },
  {
    id: "user",
    accessorFn: (row) => row.user?.name || "System",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return (
          <div 
            className="flex items-center gap-2"
            onClick={() => onRowClick(row.original)}
          >
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span>System</span>
          </div>
        );
      }
      return (
        <div 
          className="flex flex-col"
          onClick={() => onRowClick(row.original)}
        >
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    enableSorting: true,
    meta: {
      label: "User",
      searchable: true,
      exportable: true,
      minWidth: 200,
      truncate: true,
    },
  },
  {
    id: "action",
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => (
      <div 
        className="flex items-center gap-2"
        onClick={() => onRowClick(row.original)}
      >
        <span className="text-lg">{formatActionEmoji(row.original.action)}</span>
        <Badge className={getActionBadgeColor(row.original.action)}>
          {row.original.action}
        </Badge>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Action",
      filterVariant: "select",
      exportable: true,
      visibleFrom: "always",
      minWidth: 120,
    },
  },
  {
    id: "entity",
    accessorKey: "entity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entity" />
    ),
    cell: ({ row }) => (
      <div onClick={() => onRowClick(row.original)}>
        {formatEntity(row.original.entity, row.original.entityId)}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Entity",
      filterVariant: "select",
      exportable: true,
      minWidth: 180,
      truncate: true,
    },
  },
  {
    id: "ipAddress",
    accessorKey: "ipAddress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    cell: ({ row }) => {
      const parsed = truncateIP(row.original.ipAddress);
      if (!parsed.full)
        return (
          <span 
            className="text-muted-foreground"
            onClick={() => onRowClick(row.original)}
          >
            Unknown
          </span>
        );
      return (
        <div 
          title={parsed.full}
          onClick={() => onRowClick(row.original)}
        >
          {parsed.display}
        </div>
      );
    },
    enableSorting: false,
    meta: {
      label: "IP Address",
      copyable: true,
      exportable: true,
      minWidth: 130,
    },
  },
  {
    id: "userAgent",
    accessorKey: "userAgent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Agent" />
    ),
    cell: ({ row }) => (
      <div 
        title={row.original.userAgent || ""}
        onClick={() => onRowClick(row.original)}
      >
        {formatUserAgent(row.original.userAgent)}
      </div>
    ),
    enableSorting: false,
    meta: {
      label: "User Agent",
      exportable: true,
      minWidth: 150,
      truncate: true,
    },
  },
];
