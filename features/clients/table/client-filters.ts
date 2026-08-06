import type { DataTableFilter } from "@/components/shared/data-table";

export const clientFilters: DataTableFilter[] = [
  {
    id: "clientStatus",
    label: "Status",
    type: "faceted",
    column: "clientStatus",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Suspended", value: "SUSPENDED" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    id: "companyName",
    label: "Company",
    type: "faceted",
    column: "companyName",
    options: [],
  },
];
