import type { DataTableFilter } from "@/components/shared/data-table";

export const categoryFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "faceted",
    column: "status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];
