"use client";

import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { staffColumns, staffFilters, staffBulkActions } from "@/features/users/table";

interface UsersDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function UsersDataTable({
  users,
  isLoading = false,
}: UsersDataTableProps) {
  return (
    <DataTable
      tableId="staff-users"
      data={users}
      columns={staffColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ["name", "email"] }}
      filters={staffFilters}
      bulkActions={staffBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: "users",
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
        searchPlaceholder: "Search users...",
        noResults: "No users found.",
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
