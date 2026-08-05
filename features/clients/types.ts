export interface ClientProfile {
  id: string;
  userId: string;
  displayName: string | null;
  companyName: string | null;
  phone: string | null;
  timezone: string | null;
  locale: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export type ClientActionResult =
  | { success: true }
  | { success: false; error: string };
