"use client";

import { useEffect, useContext } from "react";
import { GlobalSearchContext } from "@/components/shared/global-search-provider";
import type { SearchItem } from "@/types/search";

export function useGlobalSearch(scope: string, items: SearchItem[]) {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }

  const { registerItems, unregisterItems } = context;

  useEffect(() => {
    registerItems(scope, items);

    return () => {
      unregisterItems(scope);
    };
  }, [scope, items, registerItems, unregisterItems]);
}

export function useGlobalSearchContext() {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error(
      "useGlobalSearchContext must be used within GlobalSearchProvider"
    );
  }

  return context;
}
