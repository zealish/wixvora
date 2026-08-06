"use client";

import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTableProps } from "./types";
import { useDataTable } from "./hooks/use-data-table";
import { DataTableToolbar } from "./toolbar";
import { DataTablePagination } from "./pagination";
import { DataTableLoading } from "./loading";
import { DataTableEmptyState } from "./empty-state";

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    loading,
    error,
    enabledFeatures,
    search,
    filters,
    exportOptions,
    bulkActions,
    locale,
    slots,
  } = props;

  const { table, instance, exportCSV, exportExcel } = useDataTable(props);

  if (loading) {
    return slots?.loading ? <slots.loading /> : <DataTableLoading />;
  }

  if (error) {
    return slots?.error ? (
      <slots.error error={error} />
    ) : (
      <div className="text-destructive flex flex-col items-center justify-center py-12">
        <p className="text-sm">{locale?.error ?? error.message}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return slots?.emptyState ? (
      <slots.emptyState />
    ) : (
      <DataTableEmptyState
        {...(locale?.noResults && { message: locale.noResults })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {slots?.toolbar ? (
        <slots.toolbar table={instance} />
      ) : (
        <DataTableToolbar
          table={table}
          instance={instance}
          {...(search && { search })}
          {...(filters && { filters })}
          {...(exportOptions && { exportOptions })}
          {...(bulkActions && { bulkActions })}
          onExportCSV={exportCSV}
          onExportExcel={exportExcel}
          {...(enabledFeatures?.columnVisibility && {
            showColumnToggle: enabledFeatures.columnVisibility,
          })}
          {...(locale && { locale })}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      header.column.columnDef.meta?.headerClassName
                    )}
                    style={
                      header.column.columnDef.meta?.width
                        ? { width: header.column.columnDef.meta.width }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.columnDef.meta?.className, {
                      "text-center":
                        cell.column.columnDef.meta?.align === "center",
                      "text-right":
                        cell.column.columnDef.meta?.align === "right",
                    })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {enabledFeatures?.pagination && <DataTablePagination table={table} />}
    </div>
  );
}
