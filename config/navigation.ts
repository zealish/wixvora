import { PERMISSIONS } from '@/lib/auth/permissions';
import type { PermissionKey } from '@/types/rbac';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  permission?: PermissionKey;
}

export interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

export const clientNavGroups: NavGroup[] = [
  {
    label: 'Main',
    icon: 'LayoutDashboard',
    items: [
      { title: 'Dashboard', href: '/client', icon: 'LayoutDashboard' },
      { title: 'Sites', href: '/client/sites', icon: 'Globe' },
    ]
  },
  {
    label: 'Account',
    icon: 'User',
    items: [
      { title: 'Profile', href: '/client/profile', icon: 'User' },
    ]
  }
];

export const staffNavGroups: NavGroup[] = [
  {
    label: 'Main',
    icon: 'LayoutDashboard',
    items: [
      { title: 'Dashboard', href: '/staff', icon: 'LayoutDashboard' },
    ]
  },
  {
    label: 'Management',
    icon: 'Settings',
    items: [
      { title: 'Users', href: '/staff/users', icon: 'Users', permission: PERMISSIONS.USERS_VIEW },
      { title: 'Roles', href: '/staff/roles', icon: 'Shield', permission: PERMISSIONS.ROLES_VIEW },
      { title: 'Audit Logs', href: '/staff/audit', icon: 'FileText', permission: PERMISSIONS.AUDIT_VIEW },
    ]
  }
];

// Export flattened arrays for backward compatibility
export const clientNavItems: NavItem[] = clientNavGroups.flatMap(g => g.items);
export const staffNavItems: NavItem[] = staffNavGroups.flatMap(g => g.items);
