import type { DataTableFilter } from "@/components/shared/data-table";

export const templateFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "faceted",
    column: "status",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ],
  },
];
