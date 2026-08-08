"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileType } from "lucide-react";

interface ExportMenuProps {
  data: unknown[];
  filters: unknown;
  onExport: (format: "csv" | "xlsx" | "json") => void;
  disabled?: boolean;
}

export function AuditLogsExportMenu({
  onExport,
  disabled = false,
}: ExportMenuProps): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "xlsx" | "json"): Promise<void> => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        disabled={disabled || isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Export
        {isExporting && (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4 text-yellow-600" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
