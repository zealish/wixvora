'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema/auth';
import { clients } from '@/lib/db/schema/clients';
import { auth } from '@/lib/auth/auth';
import { createAuditLog } from '@/features/audit/service';
import { signupSchema } from './validation';
import type { AuthResult } from './types';
import { eq } from 'drizzle-orm';

export async function registerClient(data: unknown): Promise<AuthResult> {
  try {
    const validated = signupSchema.parse(data);

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, validated.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
    });

    if (!result || !result.user) {
      return { success: false, error: 'Failed to create account' };
    }

    await db
      .update(user)
      .set({ accountType: 'CLIENT' })
      .where(eq(user.id, result.user.id));

    await db.insert(clients).values({
      userId: result.user.id,
      displayName: validated.name,
      companyName: validated.companyName,
    });

    await createAuditLog({
      userId: result.user.id,
      action: 'CLIENT_REGISTERED',
      entity: 'user',
      entityId: result.user.id,
      metadata: { email: validated.email },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}
