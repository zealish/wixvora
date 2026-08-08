import type { DataTableFilter } from "@/components/shared/data-table/types";
import { FileText } from "lucide-react";

export const createAuditLogFilters = (
  distinctActions: string[],
  distinctEntities: string[]
): DataTableFilter[] => [
  {
    id: "action",
    label: "Action",
    type: "faceted",
    column: "action",
    options: distinctActions.map((action) => ({
      label: action,
      value: action,
    })),
  },
  {
    id: "entity",
    label: "Entity",
    type: "faceted",
    column: "entity",
    options: distinctEntities.map((entity) => ({
      label: entity,
      value: entity,
      icon: FileText,
    })),
  },
];
