'use client';

import { useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { DataTableExportOptions, DataTableInstance } from '../types';
import { getValue, formatExportValue } from '../utils';

interface UseExportOptions<TData> {
  exportOptions: DataTableExportOptions<TData>;
  columns: ColumnDef<TData, unknown>[];
  getInstance: () => DataTableInstance<TData>;
  getAllRows: () => TData[];
}

export function useExport<TData>({
  exportOptions,
  columns,
  getInstance,
  getAllRows,
}: UseExportOptions<TData>) {
  const prepareExportData = useCallback(() => {
    // 1. Get rows (selected or all)
    let rows: TData[] = exportOptions.onlySelected
      ? getInstance().getSelectedRows()
      : getAllRows();

    // 2. Transform if provided
    let processedRows: unknown[] = rows;
    if (exportOptions.transform) {
      processedRows = rows.map((row) => exportOptions.transform!(row));
    }

    // 3. Filter columns to exportable ones
    const exportableColumns = columns.filter((col) => {
      const accessorKey = 'accessorKey' in col ? col.accessorKey : undefined;
      const id = col.id ?? (accessorKey as string);
      if (exportOptions.excludeColumns?.includes(id)) return false;
      if (col.meta?.exportable === false) return false;
      return true;
    });

    // 4. Format values for export
    const formattedData = processedRows.map((row) => {
      const formatted: Record<string, string | number | boolean | null> = {};

      exportableColumns.forEach((col) => {
        const accessorKey = 'accessorKey' in col ? col.accessorKey : undefined;
        const accessorFn = 'accessorFn' in col ? col.accessorFn : undefined;
        const id = col.id ?? (accessorKey as string);
        const label = col.meta?.label ?? id;

        let value: unknown;
        if (accessorFn) {
          value = accessorFn(row as TData, 0);
        } else if (accessorKey) {
          value = getValue(
            row as Record<string, unknown>,
            accessorKey as string
          );
        }

        // Apply column-level formatter first, then default
        if (col.meta?.exportFormatter) {
          formatted[label] = col.meta.exportFormatter(value);
        } else {
          formatted[label] = formatExportValue(value);
        }
      });

      return formatted;
    });

    return formattedData;
  }, [exportOptions, columns, getInstance, getAllRows]);

  const exportCSV = useCallback(async () => {
    const { mkConfig, generateCsv, download } = await import('export-to-csv');
    const data = prepareExportData();
    const csvConfig = mkConfig({
      filename: exportOptions.filename ?? 'export',
      fieldSeparator: ',',
      quoteStrings: true,
    });
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  }, [prepareExportData, exportOptions.filename]);

  const exportExcel = useCallback(async () => {
    const XLSX = await import('xlsx');
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${exportOptions.filename ?? 'export'}.xlsx`);
  }, [prepareExportData, exportOptions.filename]);

  return { exportCSV, exportExcel, prepareExportData };
}
