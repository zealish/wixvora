import { PERMISSIONS } from '@/lib/auth/permissions';
import type { PermissionKey } from '@/types/rbac';

export interface NavItem {
  title: string;
  href: string;
  permission?: PermissionKey;
}

export const clientNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/client' },
  { title: 'Sites', href: '/client/sites' },
  { title: 'Profile', href: '/client/profile' },
];

export const staffNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/staff' },
  { title: 'Users', href: '/staff/users', permission: PERMISSIONS.USERS_VIEW },
  { title: 'Roles', href: '/staff/roles', permission: PERMISSIONS.ROLES_VIEW },
  { title: 'Audit Logs', href: '/staff/audit', permission: PERMISSIONS.AUDIT_VIEW },
];
