"use client";

// GlobalSearch component with keyboard shortcuts
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useGlobalSearchContext } from "@/hooks/use-global-search";
import { searchItems } from "@/lib/search/scoring";
import {
  getRecentSearchItems,
  addRecentSearchItem,
  filterRecentItems,
} from "@/lib/search/storage";
import type { SearchResult, SearchCategory } from "@/types/search";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<SearchCategory, string> = {
  navigation: "Navigation",
  action: "Actions",
  page: "Current Page",
  content: "Content",
  user: "Users",
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { getAllItems } = useGlobalSearchContext();

  const allItems = getAllItems();

  const results = useMemo(() => {
    if (!query.trim()) {
      const recentItems = getRecentSearchItems();
      const recent = filterRecentItems(recentItems, allItems);
      return recent.map((item) => ({ ...item, score: 0 }));
    }

    return searchItems(allItems, query);
  }, [query, allItems]);

  const groupedResults = useMemo(() => {
    const groups = new Map<SearchCategory, SearchResult[]>();

    results.forEach((result) => {
      const existing = groups.get(result.category) || [];
      groups.set(result.category, [...existing, result]);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      label: categoryLabels[category],
      items,
    }));
  }, [results]);

  const handleSelect = (result: SearchResult) => {
    addRecentSearchItem(result.id);

    if (result.onSelect) {
      result.onSelect();
    } else if (result.href) {
      router.push(result.href);
    }

    onOpenChange(false);
    setQuery("");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder="Search for pages, actions, or content..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching by page name, action, or keyword.
              </p>
            </div>
          </CommandEmpty>
          {groupedResults.map((group) => (
            <CommandGroup key={group.category} heading={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    {Icon && <Icon className="size-4" />}
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
