"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLogWithUser } from "../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserCircle } from "lucide-react";

export function getActionBadgeColor(action: string): string {
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

export function formatTimestamp(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return formatTimestamp(date);
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const cleaned = userAgent
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-()\/.]/g, "")
    .trim();
  return truncateString(cleaned, 40);
}

export function truncateIP(ip: string | null): { display: string; full: string } {
  if (!ip) return { display: "Unknown", full: "" };
  if (ip.length <= 15) return { display: ip, full: ip };
  return {
    display: `${ip.slice(0, 6)}...${ip.slice(-4)}`,
    full: ip,
  };
}

export function formatEntity(entity: string, entityId: string | null): string {
  if (!entityId) return entity;
  return `${entity} #${truncateString(entityId, 12)}`;
}

export const columns: ColumnDef<AuditLogWithUser>[] = [
  {
    accessorKey: "createdAt",
    header: () => <div className="w-[150px]">Timestamp</div>,
    cell: ({ row }) => (
      <div className="w-[150px] space-y-0.5">
        <div className="font-medium">
          {formatTimestamp(row.original.createdAt)}
        </div>
        <div className="text-xs text-muted-foreground">
          ({formatRelativeTime(row.original.createdAt)})
        </div>
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <div className="w-[200px]">
        {column.getIsSorted() === "asc" && "▲ "}
        {column.getIsSorted() === "desc" && "▼ "}
        User
      </div>
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return (
          <div className="flex items-center gap-2 w-[200px]">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span>System</span>
          </div>
        );
      }
      return (
        <div className="flex flex-col w-[200px]">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <div className="w-[120px]">
        {column.getIsSorted() === "asc" && "▲ "}
        {column.getIsSorted() === "desc" && "▼ "}
        Action
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-[120px]">
        <span className="text-lg">{formatActionEmoji(row.original.action)}</span>
        <Badge className={getActionBadgeColor(row.original.action)}>
          {row.original.action}
        </Badge>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "entity",
    header: ({ column }) => (
      <div className="w-[180px]">
        {column.getIsSorted() === "asc" && "▲ "}
        {column.getIsSorted() === "desc" && "▼ "}
        Entity
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-[180px]">
        {formatEntity(row.original.entity, row.original.entityId)}
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => {
      const parsed = truncateIP(row.original.ipAddress);
      if (!parsed.full) return <span className="text-muted-foreground">Unknown</span>;
      return (
        <div className="w-[130px]" title={parsed.full}>
          {parsed.display}
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: "userAgent",
    header: "User Agent",
    cell: ({ row }) => (
      <div className="w-[150px]" title={row.original.userAgent || ""}>
        {formatUserAgent(row.original.userAgent)}
      </div>
    ),
    size: 150,
    enableSorting: false,
  },
];
