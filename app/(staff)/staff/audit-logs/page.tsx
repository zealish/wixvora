import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import {
  getAuditLogs,
  getDistinctActions,
  getDistinctEntities,
} from "@/features/audit/queries";
import { AuditLogsTable } from "@/features/audit/components/audit-logs-table";
import { PageHeader } from "@/components/shared/page-header";

export default async function AuditLogsPage(): Promise<React.JSX.Element> {
  try {
    await authorize(PERMISSIONS.AUDIT_VIEW);
  } catch {
    redirect("/staff/access-denied");
  }

  const [auditLogsData, distinctActions, distinctEntities] = await Promise.all([
    getAuditLogs({
      page: 1,
      pageSize: 50,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    getDistinctActions(),
    getDistinctEntities(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View and search all system audit logs and user activities"
      />

      <AuditLogsTable
        data={auditLogsData.data}
        distinctActions={distinctActions}
        distinctEntities={distinctEntities}
      />
    </div>
  );
}
