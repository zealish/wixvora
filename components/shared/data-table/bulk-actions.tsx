"use client";

import { X } from "lucide-react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { DataTableBulkAction, DataTableInstance } from "./types";

interface DataTableBulkActionsProps<TData> {
  table: TanStackTable<TData>;
  instance: DataTableInstance<TData>;
  actions: DataTableBulkAction<TData>[];
  rowsSelectedLabel?: (count: number) => string;
}

export function DataTableBulkActions<TData>({
  table,
  instance,
  actions,
  rowsSelectedLabel,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getSelectedRowModel().rows.length;

  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted/50 flex items-center gap-2 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground text-sm">
        {rowsSelectedLabel
          ? rowsSelectedLabel(selectedCount)
          : `${selectedCount} selected`}
      </span>

      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant === "destructive" ? "destructive" : "outline"}
          size="sm"
          className="h-7"
          onClick={() => {
            const rows = table
              .getSelectedRowModel()
              .rows.map((r) => r.original);
            action.onAction({ rows, table: instance });
          }}
        >
          {action.icon && <action.icon className="mr-1.5 size-3.5" />}
          {action.label}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={() => table.resetRowSelection()}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
