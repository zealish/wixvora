"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Clock, UserCircle } from "lucide-react";
import type { AuditLogWithUser } from "../types";

function getActionBadgeColor(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "bg-green-100 text-green-800";
  if (["updated"].includes(actionLower)) return "bg-blue-100 text-blue-800";
  if (["deleted"].includes(actionLower)) return "bg-red-100 text-red-800";
  if (["login"].includes(actionLower)) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return format(date, "MMM d, yyyy h:mm a");
}

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLogWithUser | null;
}

export function AuditLogDetailDialog({
  open,
  onOpenChange,
  log,
}: DetailDialogProps): React.JSX.Element | null {
  const formatMetadata = (
    metadata: Record<string, unknown> | null
  ): React.JSX.Element => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return <span className="text-muted-foreground italic">No metadata</span>;
    }
    return (
      <pre className="bg-muted rounded p-4 text-sm text-xs whitespace-pre-wrap">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    );
  };

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
              <DialogDescription>
                View complete details for this audit log entry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Logged by: {log.user?.name || "System"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  Timestamp
                </label>
                <div className="mt-1 font-medium">
                  {format(log.createdAt, "PPP p")}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  User
                </label>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <div className="font-medium">
                      {log.user?.name || "System"}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {log.user?.email || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  Action
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={getActionBadgeColor(log.action)}>
                    {log.action}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  Entity
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="font-medium">{log.entity}</div>
                </div>
                {log.entityId && (
                  <div className="text-muted-foreground text-sm">
                    {log.entityId}
                  </div>
                )}
              </div>

              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  IP Address
                </label>
                <div className="mt-1 flex items-center gap-2 font-mono text-sm">
                  {log.ipAddress || "N/A"}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs uppercase">
                  User Agent
                </label>
                <div className="mt-1 max-h-16 overflow-y-auto text-xs">
                  {log.userAgent || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-2 block text-xs uppercase">
                Metadata
              </label>
              {formatMetadata(log.metadata)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
