"use client";

import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import type { AuditLogWithUser } from "@/features/audit/types";
import { createAuditLogColumns } from "@/features/audit/table/audit-log-columns";
import { createAuditLogFilters } from "@/features/audit/table/audit-log-filters";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";

interface AuditLogsTableProps {
  data: AuditLogWithUser[];
  distinctActions: string[];
  distinctEntities: string[];
  isLoading?: boolean;
}

export function AuditLogsTable({
  data,
  distinctActions,
  distinctEntities,
  isLoading = false,
}: AuditLogsTableProps) {
  const [detailLog, setDetailLog] = useState<AuditLogWithUser | null>(null);

  const handleRowClick = useCallback((log: AuditLogWithUser) => {
    setDetailLog(log);
  }, []);

  const columns = useMemo(
    () => createAuditLogColumns(handleRowClick),
    [handleRowClick]
  );

  const filters = useMemo(
    () => createAuditLogFilters(distinctActions, distinctEntities),
    [distinctActions, distinctEntities]
  );

  return (
    <>
      <DataTable
        tableId="audit-logs"
        data={data}
        columns={columns}
        rowId={(row) => row.id}
        loading={isLoading}
        search={{ keys: ["user.name", "user.email", "entityId"] }}
        filters={filters}
        exportOptions={{
          csv: true,
          excel: true,
          filename: "audit-logs",
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
          searchPlaceholder: "Search by user name, email, or entity ID...",
          noResults: "No audit logs found.",
          rowsSelected: (count) => `${count} selected`,
        }}
      />

      <AuditLogDetailDialog
        open={!!detailLog}
        onOpenChange={(open) => !open && setDetailLog(null)}
        log={detailLog}
      />
    </>
  );
}
