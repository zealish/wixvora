export type AccountType = 'CLIENT' | 'STAFF';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  image: string | null;
}

export interface AppSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: AppUser;
}
