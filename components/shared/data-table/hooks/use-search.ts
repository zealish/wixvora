'use client';

import { useCallback } from 'react';
import type { FilterFn } from '@tanstack/react-table';
import type { DataTableSearch } from '../types';
import { getValue } from '../utils';

export function useSearch<TData>(
  search?: DataTableSearch
): FilterFn<TData> | undefined {
  const globalFilterFn: FilterFn<TData> = useCallback(
    (row, _columnId, filterValue) => {
      if (!search) return true;
      if (!filterValue || typeof filterValue !== 'string') return true;
      const searchLower = filterValue.toLowerCase();
      return search.keys.some((key) => {
        const value = getValue(
          row.original as Record<string, unknown>,
          key
        );
        return String(value ?? '')
          .toLowerCase()
          .includes(searchLower);
      });
    },
    [search]
  );

  if (!search) return undefined;

  return globalFilterFn;
}
