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
import type { DataTableProps } from "./types";
import { useDataTable } from "./hooks/use-data-table";
import { DataTableToolbar } from "./toolbar";
import { DataTablePagination } from "./pagination";
import { DataTableLoading } from "./loading";
import { DataTableEmptyState } from "./empty-state";
import {
  getHeaderClasses,
  getHeaderStyles,
  getCellClasses,
  getCellStyles,
} from "./utils";

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
    pageSizeOptions,
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

      <div className="w-full rounded-md border">
        <div className="w-full overflow-x-auto">
          <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const isVisible = header.column.getIsVisible();
                  
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={getHeaderClasses(meta)}
                      style={{
                        ...getHeaderStyles(meta),
                        ...(isVisible ? {} : { display: 'none' }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  const cellValue = cell.getValue();
                  const isVisible = cell.column.getIsVisible();
                  
                  return (
                    <TableCell
                      key={cell.id}
                      className={getCellClasses(meta)}
                      style={{
                        ...getCellStyles(meta),
                        ...(isVisible ? {} : { display: 'none' }),
                      }}
                      title={
                        meta?.truncate !== false && typeof cellValue === "string"
                          ? cellValue
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {enabledFeatures?.pagination && (
        <DataTablePagination 
          table={table} 
          {...(pageSizeOptions && { pageSizeOptions })} 
        />
      )}
    </div>
  );
}
