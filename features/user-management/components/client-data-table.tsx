"use client";

import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { clientColumns } from "@/features/clients/table/client-columns";
import { clientFilters } from "@/features/clients/table/client-filters";
import { clientBulkActions } from "@/features/clients/table/bulk-actions";

interface ClientDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function ClientDataTable({
  users,
  isLoading = false,
}: ClientDataTableProps) {
  return (
    <DataTable
      tableId="client-users"
      data={users}
      columns={clientColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ["name", "email"] }}
      filters={clientFilters}
      bulkActions={clientBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: "client-users",
      }}
      enabledFeatures={{
        sorting: true,
        filtering: true,
        pagination: true,
        export: true,
        rowSelection: true,
        columnVisibility: true,
      }}
      locale={{
        searchPlaceholder: "Search clients...",
        noResults: "No client users found.",
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
