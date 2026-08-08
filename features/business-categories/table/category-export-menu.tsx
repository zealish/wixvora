"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Code } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  prepareExportData,
} from "../lib/export-utils";
import type { CategoryWithChildren } from "../types";

interface CategoryExportMenuProps {
  data: CategoryWithChildren[];
  selectedIds: string[];
}

export function CategoryExportMenu({
  data,
  selectedIds,
}: CategoryExportMenuProps) {
  const handleExport = (format: "csv" | "excel" | "json") => {
    try {
      const exportData = prepareExportData(data, selectedIds);

      if (exportData.length === 0) {
        toast.add({
          type: "error",
          title: "No data to export",
          description: "Please select categories or adjust your filters.",
        });
        return;
      }

      switch (format) {
        case "csv":
          exportToCSV(exportData);
          break;
        case "excel":
          exportToExcel(exportData);
          break;
        case "json":
          exportToJSON(exportData);
          break;
      }

      toast.add({
        type: "success",
        title: "Export successful",
        description: `${exportData.length} ${
          exportData.length === 1 ? "category" : "categories"
        } exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.add({
        type: "error",
        title: "Export failed",
        description: "Failed to export data. Please try again.",
      });
    }
  };

  const hasData = data.length > 0;
  const selectedCount = selectedIds.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
        disabled={!hasData}
      >
        <Download className="h-4 w-4" />
        Export{selectedCount > 0 && ` (${selectedCount} selected)`}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <Code className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
