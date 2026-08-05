import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { ClientProfile } from './types';

export async function getClientByUserId(userId: string): Promise<ClientProfile | null> {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .limit(1);

  const client = result[0];

  if (!client) {
    return null;
  }

  return client;
}
