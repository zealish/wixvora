"use client";

import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { createStaffColumns } from "@/features/users/table/staff-columns";
import { staffFilters } from "@/features/users/table/staff-filters";
import { staffBulkActions } from "@/features/users/table/staff-bulk-actions";
import { StaffViewModal } from "./staff-view-modal";

interface StaffDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function StaffDataTable({
  users,
  isLoading = false,
}: StaffDataTableProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserWithProfile | null>(
    null
  );

  const handleViewStaff = useCallback((staff: UserWithProfile) => {
    setSelectedStaff(staff);
    setViewModalOpen(true);
  }, []);

  const staffColumns = useMemo(
    () => createStaffColumns(handleViewStaff),
    [handleViewStaff]
  );

  return (
    <>
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

      <StaffViewModal
        staff={selectedStaff}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </>
  );
}
