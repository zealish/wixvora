"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type PaginationState,
} from "@tanstack/react-table";
import type { DataTableProps, DataTableInstance } from "../types";
import { useSearch } from "./use-search";
import { useTablePersistence } from "./use-table-persistence";
import { useExport } from "./use-export";

const DEFAULT_PAGE_SIZE = 10;

export function useDataTable<TData>(props: DataTableProps<TData>) {
  const {
    tableId,
    data,
    columns,
    rowId,
    initialState: initialStateProp,
    enabledFeatures,
    search,
    pagination: controlledPagination,
    pageCount,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    exportOptions,
  } = props;

  // Detect controlled (server-side) mode
  const isControlledPagination =
    controlledPagination !== undefined && onPaginationChange !== undefined;
  const isControlledSorting = onSortingChange !== undefined;
  const isControlledFiltering = onColumnFiltersChange !== undefined;

  // Persistence
  const { savedState, saveState } = useTablePersistence(tableId);

  // Global search via TanStack's filter system
  const globalFilterFn = useSearch<TData>(search);

  // Internal pagination state for client-side mode
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: savedState.pageSize ?? DEFAULT_PAGE_SIZE,
    }
  );

  const pagination = isControlledPagination
    ? controlledPagination
    : internalPagination;

  const handlePaginationChange = isControlledPagination
    ? (
        updaterOrValue:
          PaginationState | ((old: PaginationState) => PaginationState)
      ) => {
        const newValue =
          typeof updaterOrValue === "function"
            ? updaterOrValue(controlledPagination!)
            : updaterOrValue;
        onPaginationChange!(newValue);
      }
    : setInternalPagination;

  // Wrap controlled sorting handler
  const handleSortingChange = isControlledSorting
    ? (updaterOrValue: unknown) => {
        const currentSorting = table?.getState().sorting ?? [];
        const newValue =
          typeof updaterOrValue === "function"
            ? (updaterOrValue as (old: unknown) => unknown)(currentSorting)
            : updaterOrValue;
        onSortingChange!(newValue as typeof currentSorting);
      }
    : undefined;

  // Wrap controlled filters handler
  const handleColumnFiltersChange = isControlledFiltering
    ? (updaterOrValue: unknown) => {
        const currentFilters = table?.getState().columnFilters ?? [];
        const newValue =
          typeof updaterOrValue === "function"
            ? (updaterOrValue as (old: unknown) => unknown)(currentFilters)
            : updaterOrValue;
        onColumnFiltersChange!(newValue as typeof currentFilters);
      }
    : undefined;

  // Merge initial state
  const mergedInitialState = useMemo(
    () => ({
      ...savedState,
      ...initialStateProp,
    }),
    [savedState, initialStateProp]
  );

  // Row ID function
  const getRowId = rowId
    ? (row: TData, _index: number, parent?: { id: string }) =>
        parent ? `${parent.id}-${rowId(row)}` : rowId(row)
    : undefined;

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      ...(mergedInitialState.sorting && {
        sorting: mergedInitialState.sorting,
      }),
    },
    initialState: mergedInitialState,
    onPaginationChange: handlePaginationChange,
    ...(handleSortingChange && { onSortingChange: handleSortingChange }),
    ...(handleColumnFiltersChange && {
      onColumnFiltersChange: handleColumnFiltersChange,
    }),
    ...(onGlobalFilterChange && { onGlobalFilterChange }),
    ...(globalFilterFn && { globalFilterFn }),
    ...(getRowId && { getRowId }),
    manualPagination: isControlledPagination,
    manualSorting: isControlledSorting,
    manualFiltering: isControlledFiltering,
    ...(isControlledPagination && pageCount !== undefined && { pageCount }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: enabledFeatures?.rowSelection ?? false,
  });

  // Watch specific state slices for persistence (exclude columnVisibility to avoid hydration issues)
  const { sorting } = table.getState();

  useEffect(() => {
    saveState({
      sorting,
      pageSize: pagination.pageSize,
    });
  }, [sorting, pagination.pageSize, saveState]);

  // Expose minimal instance
  const instance: DataTableInstance<TData> = useMemo(
    () => ({
      getSelectedRows: () =>
        table.getSelectedRowModel().rows.map((r) => r.original),
      resetRowSelection: () => table.resetRowSelection(),
    }),
    [table]
  );

  // Export
  const { exportCSV, exportExcel, prepareExportData } = useExport<TData>({
    exportOptions: exportOptions ?? { csv: false, excel: false },
    columns,
    getInstance: () => instance,
    getAllRows: () => table.getRowModel().rows.map((r) => r.original),
  });

  return {
    table,
    instance,
    exportCSV,
    exportExcel,
    prepareExportData,
    pagination,
    setPagination: handlePaginationChange,
  };
}
