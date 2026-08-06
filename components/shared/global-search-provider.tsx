"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import type { SearchItem, SearchCategory } from "@/types/search";
import type { NavGroup } from "@/config/navigation";
import {
  LayoutDashboardIcon,
  GlobeIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react";

const iconMap = {
  LayoutDashboard: LayoutDashboardIcon,
  Globe: GlobeIcon,
  User: UserIcon,
  Users: UsersIcon,
  Shield: ShieldIcon,
  FileText: FileTextIcon,
  Settings: SettingsIcon,
};

interface GlobalSearchContextValue {
  registerItems: (scope: string, items: SearchItem[]) => void;
  unregisterItems: (scope: string) => void;
  getAllItems: () => SearchItem[];
}

export const GlobalSearchContext =
  createContext<GlobalSearchContextValue | null>(null);

interface GlobalSearchProviderProps {
  children: ReactNode;
  navigationGroups: NavGroup[];
}

export function GlobalSearchProvider({
  children,
  navigationGroups,
}: GlobalSearchProviderProps) {
  const [pageItems, setPageItems] = useState<Map<string, SearchItem[]>>(
    new Map()
  );

  const registerItems = useCallback((scope: string, items: SearchItem[]) => {
    setPageItems((prev) => {
      const next = new Map(prev);
      next.set(scope, items);
      return next;
    });
  }, []);

  const unregisterItems = useCallback((scope: string) => {
    setPageItems((prev) => {
      const next = new Map(prev);
      next.delete(scope);
      return next;
    });
  }, []);

  const getAllItems = useCallback(() => {
    const navItems: SearchItem[] = navigationGroups.flatMap((group) =>
      group.items.map((item) => ({
        id: `nav-${item.href}`,
        title: item.title,
        href: item.href,
        category: "navigation" as SearchCategory,
        icon: iconMap[item.icon as keyof typeof iconMap],
        priority: 10,
        meta: { permission: item.permission },
      }))
    );

    const allPageItems = Array.from(pageItems.values()).flat();

    return [...navItems, ...allPageItems];
  }, [navigationGroups, pageItems]);

  return (
    <GlobalSearchContext.Provider
      value={{ registerItems, unregisterItems, getAllItems }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}
