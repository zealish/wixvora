'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableExportMenuProps {
  csv?: boolean;
  excel?: boolean;
  onExportCSV: () => void;
  onExportExcel: () => void;
  labels?: {
    csv?: string;
    excel?: string;
  };
}

export function DataTableExportMenu({
  csv = true,
  excel = true,
  onExportCSV,
  onExportExcel,
  labels,
}: DataTableExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {csv && (
          <DropdownMenuItem onClick={onExportCSV}>
            <FileText className="mr-2 size-4" />
            {labels?.csv ?? 'Export CSV'}
          </DropdownMenuItem>
        )}
        {excel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 size-4" />
            {labels?.excel ?? 'Export Excel'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
