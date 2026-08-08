export interface CreateAuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogWithUser {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogsResult {
  data: AuditLogWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogsFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "action" | "entity";
  sortOrder?: "asc" | "desc";
}
