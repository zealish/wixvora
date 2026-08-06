import type { DataTableFilter } from "@/components/shared/data-table";

export const staffFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "faceted",
    column: "status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Terminated", value: "TERMINATED" },
    ],
  },
  {
    id: "department",
    label: "Department",
    type: "faceted",
    column: "department",
    options: [],
  },
];
