'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { UserWithProfile } from '@/features/users/types';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/shared/data-table/column-header';

export const userColumns: ColumnDef<UserWithProfile, unknown>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Name',
      filterVariant: 'text',
      searchable: true,
      exportable: true,
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Email',
      filterVariant: 'text',
      searchable: true,
      copyable: true,
      exportable: true,
    },
  },
  {
    id: 'department',
    accessorFn: (row) => row.staff?.department ?? '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Department',
      filterVariant: 'select',
      exportable: true,
    },
  },
  {
    id: 'position',
    accessorFn: (row) => row.staff?.position ?? '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    enableSorting: true,
    meta: {
      label: 'Position',
      exportable: true,
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.staff?.employmentStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value === 'ACTIVE' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      filterVariant: 'select',
      exportable: true,
      align: 'center',
    },
  },
];
