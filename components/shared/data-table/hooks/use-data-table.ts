"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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

  const isControlledPagination =
    controlledPagination !== undefined && onPaginationChange !== undefined;
  const isControlledSorting = onSortingChange !== undefined;
  const isControlledFiltering = onColumnFiltersChange !== undefined;

  const { savedState, saveState } = useTablePersistence(tableId);

  const globalFilterFn = useSearch<TData>(search);

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

  const mergedInitialState = useMemo(
    () => ({
      ...savedState,
      ...initialStateProp,
    }),
    [savedState, initialStateProp]
  );

  const getRowId = rowId
    ? (row: TData, _index: number, parent?: { id: string }) =>
        parent ? `${parent.id}-${rowId(row)}` : rowId(row)
    : undefined;

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
    ...(enabledFeatures?.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: enabledFeatures?.rowSelection ?? false,
  });

  const tableRef = useRef(table);
  tableRef.current = table;

  const handleSortingChange = useMemo(
    () =>
      isControlledSorting
        ? (updaterOrValue: unknown) => {
            const currentSorting = tableRef.current?.getState().sorting ?? [];
            const newValue =
              typeof updaterOrValue === "function"
                ? (updaterOrValue as (old: unknown) => unknown)(currentSorting)
                : updaterOrValue;
            onSortingChange!(newValue as typeof currentSorting);
          }
        : undefined,
    [isControlledSorting, onSortingChange]
  );

  const handleColumnFiltersChange = useMemo(
    () =>
      isControlledFiltering
        ? (updaterOrValue: unknown) => {
            const currentFilters =
              tableRef.current?.getState().columnFilters ?? [];
            const newValue =
              typeof updaterOrValue === "function"
                ? (updaterOrValue as (old: unknown) => unknown)(currentFilters)
                : updaterOrValue;
            onColumnFiltersChange!(newValue as typeof currentFilters);
          }
        : undefined,
    [isControlledFiltering, onColumnFiltersChange]
  );

  useEffect(() => {
    if (handleSortingChange) {
      table.setOptions((prev) => ({
        ...prev,
        onSortingChange: handleSortingChange,
      }));
    }
  }, [table, handleSortingChange]);

  useEffect(() => {
    if (handleColumnFiltersChange) {
      table.setOptions((prev) => ({
        ...prev,
        onColumnFiltersChange: handleColumnFiltersChange,
      }));
    }
  }, [table, handleColumnFiltersChange]);

  const { sorting } = table.getState();

  useEffect(() => {
    saveState({
      sorting,
      pageSize: pagination.pageSize,
    });
  }, [sorting, pagination.pageSize, saveState]);

  const instance: DataTableInstance<TData> = useMemo(
    () => ({
      getSelectedRows: () =>
        table.getSelectedRowModel().rows.map((r) => r.original),
      resetRowSelection: () => table.resetRowSelection(),
    }),
    [table]
  );

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
