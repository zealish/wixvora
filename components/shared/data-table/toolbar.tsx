'use client';

import type { Table as TanStackTable } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type {
  DataTableSearch,
  DataTableFilter,
  DataTableExportOptions,
  DataTableBulkAction,
  DataTableInstance,
} from './types';
import { DataTableFacetedFilter } from './faceted-filter';
import { DataTableExportMenu } from './export-menu';
import { DataTableViewOptions } from './view-options';
import { DataTableBulkActions } from './bulk-actions';

interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
  instance: DataTableInstance<TData>;
  search?: DataTableSearch;
  filters?: DataTableFilter[];
  exportOptions?: DataTableExportOptions<TData>;
  bulkActions?: DataTableBulkAction<TData>[];
  onExportCSV: () => void;
  onExportExcel: () => void;
  showColumnToggle?: boolean;
  locale?: {
    searchPlaceholder?: string;
    rowsSelected?: (count: number) => string;
    export?: { csv?: string; excel?: string };
  };
}

export function DataTableToolbar<TData>({
  table,
  instance,
  search,
  filters,
  exportOptions,
  bulkActions,
  onExportCSV,
  onExportExcel,
  showColumnToggle,
  locale,
}: DataTableToolbarProps<TData>) {
  const globalFilter = table.getState().globalFilter as string;

  return (
    <div className="space-y-2">
      {bulkActions && bulkActions.length > 0 && (
        <DataTableBulkActions
          table={table}
          instance={instance}
          actions={bulkActions}
          {...(locale?.rowsSelected && { rowsSelectedLabel: locale.rowsSelected })}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {search && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={
                  locale?.searchPlaceholder ?? search.placeholder ?? 'Search...'
                }
                value={globalFilter ?? ''}
                onChange={(e) =>
                  table.setGlobalFilter(e.target.value)
                }
                className="h-8 w-[150px] pl-8 lg:w-[250px]"
              />
            </div>
          )}

          {filters?.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) return null;

            if (filter.type === 'faceted' && filter.options) {
              return (
                <DataTableFacetedFilter
                  key={filter.id}
                  column={column}
                  title={filter.label}
                  options={filter.options}
                />
              );
            }

            return null;
          })}
        </div>

        <div className="flex items-center gap-2">
          {exportOptions?.csv || exportOptions?.excel ? (
            <DataTableExportMenu
              {...(exportOptions.csv !== undefined && { csv: exportOptions.csv })}
              {...(exportOptions.excel !== undefined && { excel: exportOptions.excel })}
              onExportCSV={onExportCSV}
              onExportExcel={onExportExcel}
              {...(locale?.export && { labels: locale.export })}
            />
          ) : null}

          {showColumnToggle && <DataTableViewOptions table={table} />}
        </div>
      </div>
    </div>
  );
}
