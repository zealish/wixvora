import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/features/audit/queries";
import { AuditLogsTable } from "@/features/audit/components/audit-logs-table";
import { PageHeader } from "@/components/shared/page-header";
import { parse } from "date-fns";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.JSX.Element> {
  try {
    await authorize(PERMISSIONS.AUDIT_VIEW);
  } catch {
    redirect("/staff/access-denied");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 50;
  const action = typeof params.action === "string" ? params.action : undefined;
  const entity = typeof params.entity === "string" ? params.entity : undefined;
  const searchTerm =
    typeof params.search === "string" ? params.search : undefined;
  const startDateStr =
    typeof params.startDate === "string" ? params.startDate : undefined;
  const endDateStr =
    typeof params.endDate === "string" ? params.endDate : undefined;
  const sortBy =
    typeof params.sortBy === "string" &&
    ["createdAt", "action", "entity"].includes(params.sortBy)
      ? (params.sortBy as "createdAt" | "action" | "entity")
      : "createdAt";
  const sortOrder =
    typeof params.sortOrder === "string" &&
    ["asc", "desc"].includes(params.sortOrder)
      ? (params.sortOrder as "asc" | "desc")
      : "desc";

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    try {
      const parsed = parse(startDateStr, "yyyy-MM-dd", new Date());
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
      }
    } catch {
      // Invalid date, ignore
    }
  }

  if (endDateStr) {
    try {
      const parsed = parse(endDateStr, "yyyy-MM-dd", new Date());
      if (!isNaN(parsed.getTime())) {
        parsed.setHours(23, 59, 59, 999);
        endDate = parsed;
      }
    } catch {
      // Invalid date, ignore
    }
  }

  const filters: {
    page: number;
    pageSize: number;
    action?: string;
    entity?: string;
    searchTerm?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy: "createdAt" | "action" | "entity";
    sortOrder: "asc" | "desc";
  } = {
    page,
    pageSize,
    sortBy,
    sortOrder,
  };

  if (action) filters.action = action;
  if (entity) filters.entity = entity;
  if (searchTerm) filters.searchTerm = searchTerm;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const auditLogsData = await getAuditLogs(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View and search all system audit logs and user activities"
      />

      <AuditLogsTable
        data={auditLogsData.data}
        total={auditLogsData.total}
        filters={filters}
        onPageChange={(newPage) => newPage}
        onFilterChange={(newFilters) => newFilters}
      />
    </div>
  );
}
