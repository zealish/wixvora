import type { LucideIcon } from "lucide-react";

export const SearchCategory = {
  Navigation: "navigation",
  Action: "action",
  Page: "page",
  User: "user",
  Content: "content",
} as const;

export type SearchCategory =
  (typeof SearchCategory)[keyof typeof SearchCategory];

export interface SearchItem {
  id: string;
  title: string;
  description?: string;
  href?: string;
  category: SearchCategory;
  icon?: LucideIcon;
  keywords?: string[];
  priority?: number;
  hidden?: boolean;
  meta?: Record<string, unknown>;
  onSelect?: () => void;
}

export interface SearchResult extends SearchItem {
  score: number;
}

export interface RecentSearchItem {
  itemId: string;
  timestamp: number;
}
