import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import type { CreateAuditLogInput } from './types';

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  await db.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
