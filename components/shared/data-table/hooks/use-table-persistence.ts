"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnSizingState,
} from "@tanstack/react-table";

const STORAGE_VERSION = "v1";

interface PersistedTableState {
  sorting?: SortingState;
  columnVisibility?: VisibilityState;
  columnSizing?: ColumnSizingState;
  columnOrder?: string[];
  pageSize?: number;
  globalFilter?: string;
  columnFilters?: ColumnFiltersState;
}

function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number
): ((...args: T) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

export function useTablePersistence(tableId: string) {
  const storageKey = `datatable:${STORAGE_VERSION}:${tableId}`;

  const savedState = useMemo((): PersistedTableState => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as PersistedTableState) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const debouncedSave = useRef(
    debounce((state: PersistedTableState) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to persist table state:", error);
      }
    }, 500)
  );

  useEffect(() => {
    return () => {
      debouncedSave.current.cancel();
    };
  }, []);

  const saveState = useCallback((state: PersistedTableState) => {
    debouncedSave.current(state);
  }, []);

  return { savedState, saveState };
}
