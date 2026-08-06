export interface UserWithProfile {
  id: string;
  name: string;
  email: string;
  accountType: "CLIENT" | "STAFF";
  createdAt: Date;
  staff?: {
    id: string;
    department: string | null;
    position: string | null;
    employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
  } | null;
  client?: {
    id: string;
    displayName: string | null;
    companyName: string | null;
    phone: string | null;
    status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  } | null;
}

export type UserActionResult =
  { success: true } | { success: false; error: string };
