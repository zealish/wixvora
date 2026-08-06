'use client';

import { DataTable } from '@/components/shared/data-table';
import type { UserWithProfile } from '@/features/users/types';
import { userColumns } from '@/features/users/table/columns';
import { userFilters } from '@/features/users/table/filters';
import { userBulkActions } from '@/features/users/table/bulk-actions';

interface UsersDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function UsersDataTable({ users, isLoading = false }: UsersDataTableProps) {
  return (
    <DataTable
      tableId="staff-users"
      data={users}
      columns={userColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ['name', 'email'] }}
      filters={userFilters}
      bulkActions={userBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: 'users',
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
        searchPlaceholder: 'Search users...',
        noResults: 'No users found.',
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
