import { headers } from 'next/headers';
import { auth } from './auth';
import type { AppSession } from '@/types/auth';

export async function getSession(): Promise<AppSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return null;
  }

  return session as unknown as AppSession;
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
