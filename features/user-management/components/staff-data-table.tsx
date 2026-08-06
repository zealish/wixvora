"use client";

import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { staffColumns } from "@/features/users/table/staff-columns";
import { staffFilters } from "@/features/users/table/staff-filters";
import { staffBulkActions } from "@/features/users/table/staff-bulk-actions";

interface StaffDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function StaffDataTable({
  users,
  isLoading = false,
}: StaffDataTableProps) {
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
        filename: "staff-users",
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
        searchPlaceholder: "Search staff...",
        noResults: "No staff users found.",
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
