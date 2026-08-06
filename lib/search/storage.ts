import type { RecentSearchItem, SearchItem } from "@/types/search";

const STORAGE_KEY = "wixvora:recent-searches";
const MAX_RECENT_ITEMS = 5;
const MAX_AGE_DAYS = 30;

export function getRecentSearchItems(): RecentSearchItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const items: RecentSearchItem[] = JSON.parse(stored);
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    return items.filter((item) => now - item.timestamp < maxAge);
  } catch {
    return [];
  }
}

export function addRecentSearchItem(itemId: string): void {
  if (typeof window === "undefined") return;

  try {
    const items = getRecentSearchItems();
    const filtered = items.filter((item) => item.itemId !== itemId);

    const newItem: RecentSearchItem = {
      itemId,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function filterRecentItems(
  recentItems: RecentSearchItem[],
  allItems: SearchItem[]
): SearchItem[] {
  const itemMap = new Map(allItems.map((item) => [item.id, item]));

  return recentItems
    .map((recent) => itemMap.get(recent.itemId))
    .filter((item): item is SearchItem => item !== undefined && !item.hidden);
}

export function clearRecentSearchItems(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
