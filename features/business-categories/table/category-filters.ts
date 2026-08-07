import type { FilterOption } from "@/components/shared/data-table/types";

export interface CategoryFilterConfig {
  id: string;
  label: string;
  type: "select" | "text";
  options?: FilterOption[];
  defaultValue?: string;
  placeholder?: string;
}

export const categoryFilters: CategoryFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    defaultValue: "all",
  },
  {
    id: "search",
    label: "Search",
    type: "text",
    placeholder: "Search categories...",
  },
];
