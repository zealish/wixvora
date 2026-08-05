export interface RoleWithPermissions {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  permissions: Array<{
    id: string;
    key: string;
    resource: string;
    action: string;
    scope: string | null;
    description: string | null;
  }>;
}

export interface RoleActionResult {
  success: boolean;
  error?: string;
}
