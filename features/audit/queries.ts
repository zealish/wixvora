import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema/audit-logs";
import { user } from "@/lib/db/schema/auth";
import {
  eq,
  and,
  sql,
  ilike,
  or,
  gte,
  lte,
  asc,
  desc,
  type SQL,
} from "drizzle-orm";
import type {
  AuditLogWithUser,
  AuditLogsResult,
  AuditLogsFilters,
} from "./types";

export async function getAuditLogs(
  filters: AuditLogsFilters = {}
): Promise<AuditLogsResult> {
  const {
    page = 1,
    pageSize = 50,
    action,
    entity,
    searchTerm,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const conditions: (SQL | undefined)[] = [];

  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  if (entity) {
    conditions.push(eq(auditLogs.entity, entity));
  }

  if (searchTerm) {
    const escapedTerm = searchTerm.replace(/[\\%_]/g, "\\$&");
    conditions.push(
      or(
        ilike(auditLogs.entityId, `%${escapedTerm}%`),
        ilike(user.name, `%${escapedTerm}%`),
        ilike(user.email, `%${escapedTerm}%`)
      )
    );
  }

  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn =
    sortBy === "action"
      ? auditLogs.action
      : sortBy === "entity"
        ? auditLogs.entity
        : auditLogs.createdAt;

  const orderByFn = sortOrder === "asc" ? asc : desc;
  const offset = (page - 1) * pageSize;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        entity: auditLogs.entity,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .where(whereClause)
      .orderBy(orderByFn(orderByColumn))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map((row): AuditLogWithUser => ({
      ...row,
      metadata: row.metadata as Record<string, unknown> | null,
      user: row.user?.id ? row.user : null,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getDistinctActions(): Promise<string[]> {
  const result = await db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .orderBy(asc(auditLogs.action));

  return result.map((r) => r.action);
}

export async function getDistinctEntities(): Promise<string[]> {
  const result = await db
    .selectDistinct({ entity: auditLogs.entity })
    .from(auditLogs)
    .orderBy(asc(auditLogs.entity));

  return result.map((r) => r.entity);
}
