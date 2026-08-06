import type { SearchItem, SearchResult } from "@/types/search";

export function calculateScore(item: SearchItem, query: string): number {
  const lowerQuery = query.toLowerCase().trim();
  const lowerTitle = item.title.toLowerCase();
  const lowerDesc = item.description?.toLowerCase() || "";

  if (lowerQuery === "") return 0;

  if (lowerTitle === lowerQuery) return 100;

  if (lowerTitle.startsWith(lowerQuery)) return 80;

  if (lowerTitle.includes(lowerQuery)) return 60;

  if (item.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)))
    return 40;

  if (lowerDesc.includes(lowerQuery)) return 20;

  return 0;
}

export function filterAndScore(
  items: SearchItem[],
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return items
      .filter((item) => !item.hidden)
      .map((item) => ({
        ...item,
        score: 0,
      }));
  }

  return items
    .filter((item) => !item.hidden)
    .map((item) => ({
      ...item,
      score: calculateScore(item, query),
    }))
    .filter((result) => result.score > 0);
}

export function sortResults(results: SearchResult[]): SearchResult[] {
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    if (a.priority !== b.priority) {
      return (a.priority ?? 50) - (b.priority ?? 50);
    }

    return a.title.localeCompare(b.title);
  });
}

export function searchItems(
  items: SearchItem[],
  query: string
): SearchResult[] {
  const results = filterAndScore(items, query);
  return sortResults(results);
}
