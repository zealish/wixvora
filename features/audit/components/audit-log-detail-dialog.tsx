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
import { formatRelativeTime, getActionBadgeColor } from "./columns";

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
  const formatMetadata = (metadata: Record<string, unknown> | null): React.JSX.Element => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return <span className="text-muted-foreground italic">No metadata</span>;
    }
    return (
      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded text-xs">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    );
  };

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
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

        <div className="flex-1 pr-4 overflow-y-auto">
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
                <label className="text-xs text-muted-foreground uppercase">
                  Timestamp
                </label>
                <div className="font-medium mt-1">
                  {format(log.createdAt, "PPP p")}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  User
                </label>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <div className="font-medium">
                      {log.user?.name || "System"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.user?.email || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  Action
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={getActionBadgeColor(log.action)}>
                    {log.action}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  Entity
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="font-medium">{log.entity}</div>
                </div>
                {log.entityId && (
                  <div className="text-sm text-muted-foreground">
                    {log.entityId}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  IP Address
                </label>
                <div className="mt-1 font-mono text-sm flex items-center gap-2">
                  {log.ipAddress || "N/A"}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  User Agent
                </label>
                <div className="mt-1 text-xs max-h-16 overflow-y-auto">
                  {log.userAgent || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase mb-2 block">
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
